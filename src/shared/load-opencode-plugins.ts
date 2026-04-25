import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

import { parseJsonc } from "./jsonc-parser"
import { CONFIG_BASENAME } from "./plugin-identity"

interface OpencodeConfig {
  plugin?: string[]
}

function getWindowsAppdataDir(): string | null {
  return process.env.APPDATA || null
}

function getConfigPaths(directory: string): string[] {
  const crossPlatformDir = path.join(os.homedir(), ".config")
  const paths = [
    path.join(directory, ".opencode", `${CONFIG_BASENAME}.jsonc`),
    path.join(crossPlatformDir, "opencode", `${CONFIG_BASENAME}.jsonc`),
  ]

  if (process.platform === "win32") {
    const appdataDir = getWindowsAppdataDir()
    if (appdataDir) {
      paths.push(path.join(appdataDir, "opencode", `${CONFIG_BASENAME}.jsonc`))
    }
  }

  return paths
}

export function loadOpencodePlugins(directory: string): string[] {
  const pluginEntries: string[] = []
  const seenPluginEntries = new Set<string>()

  for (const configPath of getConfigPaths(directory)) {
    try {
      if (!fs.existsSync(configPath)) continue

      const content = fs.readFileSync(configPath, "utf-8")
      const parsed = parseJsonc<OpencodeConfig>(content)
      const plugins = parsed.plugin
      if (plugins === undefined) {
        continue
      }
      if (!Array.isArray(plugins)) {
        throw new Error(`Invalid plugin config in ${configPath}: 'plugin' must be an array of strings`)
      }

      for (const rawPlugin of plugins) {
        if (typeof rawPlugin !== "string") {
          throw new Error(`Invalid plugin entry in ${configPath}: plugin entries must be strings`)
        }
        const plugin = rawPlugin
        if (seenPluginEntries.has(plugin)) continue
        seenPluginEntries.add(plugin)
        pluginEntries.push(plugin)
      }
    } catch (error) {
      throw new Error(`Failed to load OpenCode plugins from ${configPath}: ${String(error)}`)
    }
  }

  return pluginEntries
}
