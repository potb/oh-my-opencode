import type { OhMyOpenCodeConfig } from "../config"
import type { ModelCacheState, VisionCapableModel } from "../plugin-state"

import { setVisionCapableModelsCache } from "../shared/vision-capable-models-cache"
import { log } from "../shared"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"
import { applyRuntimeAgentConfig } from "./runtime-agent-config"

type ProviderModelConfig = {
  limit?: { context?: number }
  modalities?: {
    input?: string[]
  }
  capabilities?: {
    input?: {
      image?: boolean
    }
  }
}

type ProviderConfig = {
  options?: { headers?: Record<string, string> }
  models?: Record<string, ProviderModelConfig>
}

type AgentWithPermission = { permission?: Record<string, unknown> }

function supportsImageInput(modelConfig: ProviderModelConfig | undefined): boolean {
  return modelConfig?.modalities?.input?.includes("image") === true
}

function applyProviderMetadata(config: Record<string, unknown>, modelCacheState: ModelCacheState): void {
  const providers = config.provider as Record<string, ProviderConfig> | undefined
  const modelContextLimitsCache = modelCacheState.modelContextLimitsCache

  modelContextLimitsCache.clear()

  const anthropicBeta = providers?.anthropic?.options?.headers?.["anthropic-beta"]
  modelCacheState.anthropicContext1MEnabled = anthropicBeta?.includes("context-1m") ?? false

  const visionCapableModelsCache = modelCacheState.visionCapableModelsCache
    ?? new Map<string, VisionCapableModel>()
  modelCacheState.visionCapableModelsCache = visionCapableModelsCache
  visionCapableModelsCache.clear()
  setVisionCapableModelsCache(visionCapableModelsCache)

  if (!providers) return

  for (const [providerID, providerConfig] of Object.entries(providers)) {
    const models = providerConfig?.models
    if (!models) continue

    for (const [modelID, modelConfig] of Object.entries(models)) {
      if (supportsImageInput(modelConfig)) {
        visionCapableModelsCache.set(`${providerID}/${modelID}`, { providerID, modelID })
      }

      const contextLimit = modelConfig?.limit?.context
      if (!contextLimit) continue

      modelContextLimitsCache.set(`${providerID}/${modelID}`, contextLimit)
    }
  }
}

function getConfigQuestionPermission(): string | null {
  const configContent = process.env.OPENCODE_CONFIG_CONTENT
  if (!configContent) return null

  try {
    const parsed = JSON.parse(configContent) as { permission?: { question?: string | null } }
    return parsed.permission?.question ?? null
  } catch {
    return null
  }
}

function agentByKey(agentResult: Record<string, unknown>, key: string): AgentWithPermission | undefined {
  return (agentResult[getAgentListDisplayName(key)]
    ?? agentResult[getAgentDisplayName(key)]
    ?? agentResult[key]) as AgentWithPermission | undefined
}

function applyToolPermissions(args: {
  config: Record<string, unknown>
  pluginConfig: OhMyOpenCodeConfig
  agentResult: Record<string, unknown>
}): void {
  args.config.tools = {
    ...(args.config.tools as Record<string, unknown>),
    "grep_app_*": false,
    LspHover: false,
    LspCodeActions: false,
    LspCodeActionResolve: false,
    background_cancel: false,
    background_output: false,
    interactive_bash: false,
    session_info: false,
    session_list: false,
    session_read: false,
    session_search: false,
    skill: false,
    skill_mcp: false,
    "task_*": false,
    teammate: false,
    todoread: false,
    todowrite: false,
  }

  const isCliRunMode = process.env.OPENCODE_CLI_RUN_MODE === "true"
  const configQuestionPermission = getConfigQuestionPermission()
  const isQuestionDisabledByPlugin = args.pluginConfig.disabled_tools?.includes("question") ?? false
  const questionPermission = isQuestionDisabledByPlugin
    ? "deny"
    : configQuestionPermission === "deny"
      ? "deny"
      : isCliRunMode
        ? "deny"
        : "allow"

  const librarian = agentByKey(args.agentResult, "librarian")
  if (librarian) {
    librarian.permission = { ...librarian.permission, "grep_app_*": "allow" }
  }

  const sisyphus = agentByKey(args.agentResult, "sisyphus")
  if (sisyphus) {
    sisyphus.permission = {
      ...sisyphus.permission,
      task: "allow",
      question: questionPermission,
    }
  }

  const junior = agentByKey(args.agentResult, "sisyphus-junior")
  if (junior) {
    junior.permission = {
      ...junior.permission,
      task: "allow",
    }
  }

  args.config.permission = {
    webfetch: "allow",
    external_directory: "allow",
    ...(args.config.permission as Record<string, unknown>),
    task: "deny",
  }
}

export function createRuntimeConfigHook(args: {
  ctx: { directory: string; client?: unknown }
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
}): (config: Record<string, unknown>) => Promise<void> {
  const { ctx, pluginConfig, modelCacheState } = args

  return async (config: Record<string, unknown>): Promise<void> => {
    const formatterConfig = config.formatter

    applyProviderMetadata(config, modelCacheState)

    const agentResult = await applyRuntimeAgentConfig({
      config,
      pluginConfig,
      ctx,
    })

    applyToolPermissions({ config, pluginConfig, agentResult })
    config.command = {}
    config.mcp = {}
    config.formatter = formatterConfig

    log("[runtime-config-hook] config hook applied", {
      agentCount: Object.keys(agentResult).length,
      commandCount: Object.keys((config.command as Record<string, unknown>) ?? {}).length,
    })
  }
}
