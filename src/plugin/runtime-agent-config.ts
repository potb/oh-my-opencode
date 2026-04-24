import { createBuiltinAgents } from "../agents"
import type { OhMyOpenCodeConfig } from "../config"
import { FIXED_PRODUCT_AGENT_NAMES, REMOVED_AGENT_NAMES } from "../fixed-product"
import {
  getAgentRuntimeName,
} from "../shared/agent-display-names"
import { log } from "../shared"

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

  const agentResult = args.config.agent as Record<string, unknown>
  log("[runtime-agent-config] agents loaded", { agentKeys: Object.keys(agentResult) })
  return agentResult
}
