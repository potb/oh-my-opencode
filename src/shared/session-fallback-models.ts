import type { OhMyOpenCodeConfig } from "../config"
import type { FallbackModelObject } from "../config/schema/fallback-models"
import { log } from "./logger"
import { normalizeFallbackModels } from "./model-resolver"
import { SessionCategoryRegistry } from "./session-category-registry"

const AGENT_PATTERN = /^([^:/]+):/

export function getRawFallbackModels(
  sessionID: string,
  agent: string | undefined,
  pluginConfig: OhMyOpenCodeConfig | undefined,
): (string | FallbackModelObject)[] | undefined {
  if (!pluginConfig) return undefined

  const sessionCategory = SessionCategoryRegistry.get(sessionID)
  if (sessionCategory && pluginConfig.categories?.[sessionCategory]?.fallback_models) {
    return normalizeFallbackModels(pluginConfig.categories[sessionCategory].fallback_models)
  }

  const tryGetFallbackFromAgent = (agentName: string): (string | FallbackModelObject)[] | undefined => {
    const agentConfig = pluginConfig.agents?.[agentName as keyof typeof pluginConfig.agents]
    if (!agentConfig) return undefined

    if (agentConfig.fallback_models) {
      return normalizeFallbackModels(agentConfig.fallback_models)
    }

    const agentCategory = agentConfig.category
    if (agentCategory && pluginConfig.categories?.[agentCategory]?.fallback_models) {
      return normalizeFallbackModels(pluginConfig.categories[agentCategory].fallback_models)
    }

    return undefined
  }

  if (agent) {
    const result = tryGetFallbackFromAgent(agent)
    if (result) return result
  }

  const sessionAgentMatch = sessionID.match(AGENT_PATTERN)
  if (sessionAgentMatch) {
    const detectedAgent = sessionAgentMatch[1].toLowerCase()
    const result = tryGetFallbackFromAgent(detectedAgent)
    if (result) return result
  }

  log("[model-fallback] No category/agent fallback models resolved for session", { sessionID, agent })
  return undefined
}
