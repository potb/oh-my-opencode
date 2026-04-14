import { createBuiltinAgents } from "../agents";
import type { OhMyOpenCodeConfig } from "../config";
import { log } from "../shared";
import { getAgentRuntimeName } from "../shared/agent-display-names";
import { registerAgentName } from "../features/claude-code-session-state";
import { FIXED_PRODUCT_AGENT_NAMES, REMOVED_AGENT_NAMES } from "../fixed-product";
import { reorderAgentsByPriority } from "./agent-priority-order";
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper";

export async function applyAgentConfig(params: {
  config: Record<string, unknown>;
  pluginConfig: OhMyOpenCodeConfig;
  ctx: { directory: string; client?: any };
}): Promise<Record<string, unknown>> {
  const currentModel = params.config.model as string | undefined;
  const disableOmoEnv = params.pluginConfig.experimental?.disable_omo_env ?? false;

  const builtinAgents = await createBuiltinAgents(
    [...(params.pluginConfig.disabled_agents ?? []), ...REMOVED_AGENT_NAMES],
    {},
    params.ctx.directory,
    currentModel,
    undefined,
    params.pluginConfig.git_master,
    [],
    [],
    undefined,
    currentModel,
    new Set<string>(),
    false,
    disableOmoEnv,
  );

  params.config.default_agent = getAgentRuntimeName("sisyphus");
  params.config.agent = Object.fromEntries(
    Object.entries(builtinAgents).filter(([name]) =>
      FIXED_PRODUCT_AGENT_NAMES.includes(name as (typeof FIXED_PRODUCT_AGENT_NAMES)[number]),
    ),
  );

  if (params.config.agent) {
    params.config.agent = remapAgentKeysToDisplayNames(
      params.config.agent as Record<string, unknown>,
    );
    params.config.agent = reorderAgentsByPriority(
      params.config.agent as Record<string, unknown>,
    );
  }

  const agentResult = params.config.agent as Record<string, unknown>;
  for (const name of Object.keys(agentResult)) {
    registerAgentName(name);
  }
  log("[config-handler] agents loaded", { agentKeys: Object.keys(agentResult) });
  return agentResult;
}
