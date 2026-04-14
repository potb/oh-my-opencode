import type { OhMyOpenCodeConfig } from "../config";
import type { ModelCacheState } from "../plugin-state";
import { log } from "../shared";
import { applyAgentConfig } from "./agent-config-handler";
import { applyProviderConfig } from "./provider-config-handler";
import { applyToolConfig } from "./tool-config-handler";
import { clearFormatterCache } from "../tools/hashline-edit/formatter-trigger"

export { resolveCategoryConfig } from "./category-config-resolver";

export interface ConfigHandlerDeps {
  ctx: { directory: string; client?: any };
  pluginConfig: OhMyOpenCodeConfig;
  modelCacheState: ModelCacheState;
}

export function createConfigHandler(deps: ConfigHandlerDeps) {
  const { ctx, pluginConfig, modelCacheState } = deps;

  return async (config: Record<string, unknown>) => {
    const formatterConfig = config.formatter;

    applyProviderConfig({ config, modelCacheState });
    clearFormatterCache()

    const agentResult = await applyAgentConfig({
      config,
      pluginConfig,
      ctx,
    });

    applyToolConfig({ config, pluginConfig, agentResult });
    config.command = {};
    config.mcp = {};

    config.formatter = formatterConfig;

    log("[config-handler] config handler applied", {
      agentCount: Object.keys(agentResult).length,
      commandCount: Object.keys((config.command as Record<string, unknown>) ?? {})
        .length,
    });
  };
}
