export interface DelegatedModelConfig {
  providerID: string
  modelID: string
  variant?: string
  reasoningEffort?: string
  temperature?: number
  top_p?: number
  maxTokens?: number
  thinking?: { type: "enabled" | "disabled"; budgetTokens?: number }
}

type ModelResolutionProvenance =
  | "override"
  | "category-default"

type ModelResolutionResult = {
  model: string
  provenance: ModelResolutionProvenance
  variant?: string
  attempted?: string[]
  reason?: string
}
