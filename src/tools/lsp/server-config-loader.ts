import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { z } from "zod"

import { BUILTIN_SERVERS } from "./constants"
import type { ResolvedServer } from "./types"
import { getOpenCodeConfigDir } from "../../shared"
import { parseJsonc, detectConfigFile, detectPluginConfigFile } from "../../shared/jsonc-parser"

interface LspEntry {
  disabled?: boolean
  command?: string[]
  extensions?: string[]
  priority?: number
  env?: Record<string, string>
  initialization?: Record<string, unknown>
}

interface ConfigJson {
  lsp?: Record<string, LspEntry>
}

const LspEntrySchema = z.object({
  disabled: z.boolean().optional(),
  command: z.array(z.string()).optional(),
  extensions: z.array(z.string()).optional(),
  priority: z.number().optional(),
  env: z.record(z.string(), z.string()).optional(),
  initialization: z.record(z.string(), z.unknown()).optional(),
}).strict()

const ConfigJsonSchema = z.object({
  lsp: z.record(z.string(), LspEntrySchema).optional(),
}).passthrough()

type ConfigSource = "project" | "user"

interface ServerWithSource extends ResolvedServer {
  source: ConfigSource
}

function loadJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null
  const parsed = parseJsonc(readFileSync(path, "utf-8"))
  return ConfigJsonSchema.parse(parsed) as T
}

function getConfigPaths(): { project: string; user: string } {
  const cwd = process.cwd()
  const configDir = getOpenCodeConfigDir({ binary: "opencode" })
  return {
    project: detectPluginConfigFile(join(cwd, ".opencode")).path,
    user: detectPluginConfigFile(configDir).path,
  }
}

function loadAllConfigs(): Map<ConfigSource, ConfigJson> {
  const paths = getConfigPaths()
  const configs = new Map<ConfigSource, ConfigJson>()

  const project = loadJsonFile<ConfigJson>(paths.project)
  if (project) configs.set("project", project)

  const user = loadJsonFile<ConfigJson>(paths.user)
  if (user) configs.set("user", user)

  return configs
}

export function getMergedServers(): ServerWithSource[] {
  const configs = loadAllConfigs()
  const servers: ServerWithSource[] = []
  const disabled = new Set<string>()
  const seen = new Set<string>()

  const sources: ConfigSource[] = ["project", "user"]

  for (const source of sources) {
    const config = configs.get(source)
    if (!config?.lsp) continue

    for (const [id, entry] of Object.entries(config.lsp)) {
      if (entry.disabled) {
        disabled.add(id)
        continue
      }

      if (seen.has(id)) continue
      if (!entry.command || !entry.extensions) {
        throw new Error(`Invalid LSP config for '${id}' in ${source}: both 'command' and 'extensions' are required`)
      }

      servers.push({
        id,
        command: entry.command,
        extensions: entry.extensions,
        priority: entry.priority ?? 0,
        env: entry.env,
        initialization: entry.initialization,
        source,
      })
      seen.add(id)
    }
  }

  for (const [id, config] of Object.entries(BUILTIN_SERVERS)) {
    if (disabled.has(id) || seen.has(id)) continue

    servers.push({
      id,
      command: config.command,
      extensions: config.extensions,
      priority: -100,
      source: "user",
    })
  }

  return servers.sort((a, b) => {
    if (a.source !== b.source) {
      const order: Record<ConfigSource, number> = { project: 0, user: 1 }
      return order[a.source] - order[b.source]
    }
    return b.priority - a.priority
  })
}
