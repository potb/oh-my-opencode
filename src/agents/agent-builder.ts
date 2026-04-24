import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentFactory } from "./types"
import type { CategoriesConfig, CategoryConfig, GitMasterConfig } from "../config/schema"
import type { BrowserAutomationProvider } from "../config/schema"
import { mergeCategories } from "../shared/merge-categories"

type AgentSource = AgentFactory | AgentConfig

export function isFactory(source: AgentSource): source is AgentFactory {
  return typeof source === "function"
}

export function buildAgent(
  source: AgentSource,
  model: string,
  categories?: CategoriesConfig,
  _gitMasterConfig?: GitMasterConfig,
  _browserProvider?: BrowserAutomationProvider,
  _disabledSkills?: Set<string>
): AgentConfig {
  const base = isFactory(source) ? source(model) : { ...source }
  const categoryConfigs: Record<string, CategoryConfig> = mergeCategories(categories)

  const agentWithCategory = base as AgentConfig & { category?: string; skills?: string[]; variant?: string }
  if (agentWithCategory.category) {
    const categoryConfig = categoryConfigs[agentWithCategory.category]
    if (categoryConfig) {
      if (!base.model) {
        base.model = categoryConfig.model
      }
      if (base.temperature === undefined && categoryConfig.temperature !== undefined) {
        base.temperature = categoryConfig.temperature
      }
      if (base.variant === undefined && categoryConfig.variant !== undefined) {
        base.variant = categoryConfig.variant
      }
    }
  }

  return base
}
