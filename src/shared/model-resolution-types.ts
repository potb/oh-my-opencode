import type { FallbackEntry } from "./model-requirements"

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

type ModelResolutionRequest = {
  intent?: {
    uiSelectedModel?: string
    userModel?: string
    categoryDefaultModel?: string
  }
  constraints: {
    availableModels: Set<string>
  }
  policy?: {
    fallbackChain?: FallbackEntry[]
    systemDefaultModel?: string
  }
}

type ModelResolutionProvenance =
  | "override"
  | "category-default"
  | "provider-fallback"
  | "system-default"

type ModelResolutionResult = {
  model: string
  provenance: ModelResolutionProvenance
  variant?: string
  attempted?: string[]
  reason?: string
}
