import { createBuiltinAgents } from "../agents"
import type { OhMyOpenCodeConfig } from "../config"
import { FIXED_PRODUCT_AGENT_NAMES, REMOVED_AGENT_NAMES } from "../fixed-product"
import {
  getAgentListDisplayName,
  getAgentRuntimeName,
} from "../shared/agent-display-names"
import { log } from "../shared"

const CANONICAL_CORE_AGENT_ORDER = ["sisyphus"] as const

function rewriteAgentNameForListDisplay(key: string, value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return value
  }

  const agent = value as Record<string, unknown>
  return {
    ...agent,
    name: getAgentRuntimeName(key),
  }
}

function remapAgentKeysToDisplayNames(agents: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(agents)) {
    const displayName = getAgentListDisplayName(key)
    if (displayName && displayName !== key) {
      result[displayName] = rewriteAgentNameForListDisplay(key, value)
      continue
    }

    result[key] = value
  }

  return result
}

function reorderAgentsByPriority(agents: Record<string, unknown>): Record<string, unknown> {
  const ordered: Record<string, unknown> = {}
  const seen = new Set<string>()

  for (const [index, configKey] of CANONICAL_CORE_AGENT_ORDER.entries()) {
    const displayName = getAgentListDisplayName(configKey)
    if (Object.prototype.hasOwnProperty.call(agents, displayName)) {
      const agentConfig = agents[displayName]
      ordered[displayName] = typeof agentConfig === "object" && agentConfig !== null
        ? { ...agentConfig, order: index + 1 }
        : agentConfig
      seen.add(displayName)
    }
  }

  const nonCoreKeys = Object.keys(agents)
    .filter((key) => !seen.has(key))
    .sort((a, b) => a.localeCompare(b))

  for (const key of nonCoreKeys) {
    ordered[key] = agents[key]
  }

  return ordered
}

export async function applyRuntimeAgentConfig(args: {
  config: Record<string, unknown>
  pluginConfig: OhMyOpenCodeConfig
  ctx: { directory: string; client?: unknown }
}): Promise<Record<string, unknown>> {
  const currentModel = args.config.model as string | undefined
  const disableOmoEnv = args.pluginConfig.experimental?.disable_omo_env ?? false

  const builtinAgents = await createBuiltinAgents(
    [...(args.pluginConfig.disabled_agents ?? []), ...REMOVED_AGENT_NAMES],
    {},
    args.ctx.directory,
    currentModel,
    undefined,
    args.pluginConfig.git_master,
    [],
    [],
    undefined,
    currentModel,
    new Set<string>(),
    false,
    disableOmoEnv,
  )

  args.config.default_agent = getAgentRuntimeName("sisyphus")
  args.config.agent = Object.fromEntries(
    Object.entries(builtinAgents).filter(([name]) =>
      FIXED_PRODUCT_AGENT_NAMES.includes(name as (typeof FIXED_PRODUCT_AGENT_NAMES)[number]),
    ),
  )

  if (args.config.agent) {
    args.config.agent = remapAgentKeysToDisplayNames(args.config.agent as Record<string, unknown>)
    args.config.agent = reorderAgentsByPriority(args.config.agent as Record<string, unknown>)
  }

  const agentResult = args.config.agent as Record<string, unknown>
  log("[runtime-agent-config] agents loaded", { agentKeys: Object.keys(agentResult) })
  return agentResult
}
