import type { ToolDefinition } from "@opencode-ai/plugin"
import type { OhMyOpenCodeConfig } from "../config"
import type { PluginContext, ToolsRecord } from "./types"

import {
  builtinTools,
  createGrepTools,
  createGlobTools,
  createAstGrepTools,
  createDelegateTask,
} from "../tools"
import { filterDisabledTools } from "../shared/disabled-tools"
import { log } from "../shared"

import type { Managers } from "../create-managers"
import { normalizeToolArgSchemas } from "./normalize-tool-arg-schemas"

type ToolRegistryFactories = {
  builtinTools: typeof builtinTools
  createGrepTools: typeof createGrepTools
  createGlobTools: typeof createGlobTools
  createAstGrepTools: typeof createAstGrepTools
  createDelegateTask: typeof createDelegateTask
}

const defaultToolRegistryFactories: ToolRegistryFactories = {
  builtinTools,
  createGrepTools,
  createGlobTools,
  createAstGrepTools,
  createDelegateTask,
}

type ToolRegistryResult = {
  filteredTools: ToolsRecord
  taskSystemEnabled: boolean
}

const LOW_PRIORITY_TOOL_ORDER = [
  "edit",
  "ast_grep_replace",
  "ast_grep_search",
  "glob",
  "grep",
  "task",
  "lsp_rename",
  "lsp_prepare_rename",
  "lsp_find_references",
  "lsp_goto_definition",
  "lsp_symbols",
  "lsp_diagnostics",
] as const

function trimToolsToCap(filteredTools: ToolsRecord, maxTools: number): void {
  const toolNames = Object.keys(filteredTools)
  if (toolNames.length <= maxTools) return

  const removableToolNames = [
    ...LOW_PRIORITY_TOOL_ORDER.filter((toolName) => toolNames.includes(toolName)),
    ...toolNames
      .filter((toolName) => !LOW_PRIORITY_TOOL_ORDER.includes(toolName as (typeof LOW_PRIORITY_TOOL_ORDER)[number]))
      .sort(),
  ]

  let currentCount = toolNames.length
  let removed = 0

  for (const toolName of removableToolNames) {
    if (currentCount <= maxTools) break
    if (!filteredTools[toolName]) continue
    delete filteredTools[toolName]
    currentCount -= 1
    removed += 1
  }

  log(
    `[tool-registry] Trimmed ${removed} tools to satisfy max_tools=${maxTools}. Final plugin tool count=${currentCount}.`,
  )
}

export function createToolRegistry(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  managers: Pick<Managers, "backgroundManager">
  toolFactories?: Partial<ToolRegistryFactories>
}): ToolRegistryResult {
  const {
    ctx,
    pluginConfig,
    managers,
    toolFactories,
  } = args
  const factories: ToolRegistryFactories = {
    ...defaultToolRegistryFactories,
    ...toolFactories,
  }
  const delegateTask = factories.createDelegateTask({
    manager: managers.backgroundManager,
    client: ctx.client,
    directory: ctx.directory,
    syncPollTimeoutMs: pluginConfig.background_task.syncPollTimeoutMs,
  })

  const allTools: Record<string, ToolDefinition> = {
    ...factories.builtinTools,
    ...factories.createGrepTools(ctx),
    ...factories.createGlobTools(ctx),
    ...factories.createAstGrepTools(ctx),
    task: delegateTask,
  }

  for (const toolDefinition of Object.values(allTools)) {
    normalizeToolArgSchemas(toolDefinition)
  }

  const filteredTools: ToolsRecord = filterDisabledTools(allTools, pluginConfig.disabled_tools)

  const maxTools = pluginConfig.experimental?.max_tools
  if (maxTools) {
    trimToolsToCap(filteredTools, maxTools)
  }

  return {
    filteredTools,
    taskSystemEnabled: false,
  }
}
