import { log } from "./logger"
import { fuzzyMatchModel } from "./model-availability"
import { normalizeModel } from "./model-normalization"

type ModelResolutionRequest = {
  intent?: {
    uiSelectedModel?: string
    userModel?: string
    categoryDefaultModel?: string
  }
  constraints: {
    availableModels: Set<string>
  }
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

export function resolveModelPipeline(
  request: ModelResolutionRequest,
): ModelResolutionResult | undefined {
  const attempted: string[] = []
  const { intent, constraints } = request
  const availableModels = constraints.availableModels

  const normalizedUiModel = normalizeModel(intent?.uiSelectedModel)
  if (normalizedUiModel) {
    log("Model resolved via UI selection", { model: normalizedUiModel })
    return { model: normalizedUiModel, provenance: "override" }
  }

  const normalizedUserModel = normalizeModel(intent?.userModel)
  if (normalizedUserModel) {
    log("Model resolved via config override", { model: normalizedUserModel })
    return { model: normalizedUserModel, provenance: "override" }
  }

  const normalizedCategoryDefault = normalizeModel(intent?.categoryDefaultModel)
  if (!normalizedCategoryDefault) {
    return undefined
  }

  attempted.push(normalizedCategoryDefault)

  if (availableModels.size === 0) {
    log("Category default model unavailable without available-model cache", {
      model: normalizedCategoryDefault,
    })
    return undefined
  }

  const parts = normalizedCategoryDefault.split("/")
  const providerHint = parts.length >= 2 ? [parts[0]] : undefined
  const match = fuzzyMatchModel(normalizedCategoryDefault, availableModels, providerHint)

  if (!match) {
    log("Category default model not available", {
      model: normalizedCategoryDefault,
    })
    return undefined
  }

  log("Model resolved via category default (fuzzy matched)", {
    original: normalizedCategoryDefault,
    matched: match,
  })

  return { model: match, provenance: "category-default", attempted }
}
