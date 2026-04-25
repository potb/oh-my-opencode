import { normalizeModel } from "../../shared/model-normalization"
import { fuzzyMatchModel } from "../../shared/model-availability"
import { log } from "../../shared/logger"
import { parseModelString, parseVariantFromModelID } from "./model-string-parser"

function isExplicitHighModel(model: string): boolean {
  return /(?:^|\/)[^/]+-high$/.test(model)
}

function getExplicitHighBaseModel(model: string): string | null {
  return isExplicitHighModel(model) ? model.replace(/-high$/, "") : null
}

function parseUserModel(model: string): {
  baseModel: string
  providerHint?: string[]
  variant?: string
} | undefined {
  const normalized = normalizeModel(model)
  if (!normalized) {
    return undefined
  }

  const parsedFullModel = parseModelString(normalized)
  if (parsedFullModel) {
    return {
      baseModel: `${parsedFullModel.providerID}/${parsedFullModel.modelID}`,
      providerHint: [parsedFullModel.providerID],
      variant: parsedFullModel.variant,
    }
  }

  const parsedModel = parseVariantFromModelID(normalized)
  if (!parsedModel.modelID) {
    return undefined
  }

  return {
    baseModel: parsedModel.modelID,
    variant: parsedModel.variant,
  }
}

export function resolveModelForDelegateTask(input: {
  userModel?: string
  categoryDefaultModel?: string
  isUserConfiguredCategoryModel?: boolean
  availableModels: Set<string>
}): { model: string; variant?: string } | { skipped: true } | undefined {
  const userModel = normalizeModel(input.userModel)
  if (userModel) {
    const parsed = parseUserModel(userModel)
    if (parsed?.variant) {
      return { model: parsed.baseModel, variant: parsed.variant }
    }
    return { model: userModel }
  }

  if (input.availableModels.size === 0) {
    return { skipped: true }
  }

  const categoryDefault = normalizeModel(input.categoryDefaultModel)
  const explicitHighBaseModel = categoryDefault ? getExplicitHighBaseModel(categoryDefault) : null
  const explicitHighModel = explicitHighBaseModel ? categoryDefault : undefined
  if (!categoryDefault) {
    return undefined
  }

  if (input.isUserConfiguredCategoryModel) {
    log("[resolveModelForDelegateTask] using user-configured category model (bypass validation)", {
      categoryDefaultModel: categoryDefault,
    })
    const parsed = parseUserModel(categoryDefault)
    if (parsed?.variant) {
      return { model: parsed.baseModel, variant: parsed.variant }
    }
    return { model: categoryDefault }
  }

  const parts = categoryDefault.split("/")
  const providerHint = parts.length >= 2 ? [parts[0]] : undefined
  const match = fuzzyMatchModel(categoryDefault, input.availableModels, providerHint)
  if (!match) {
    return undefined
  }

  if (isExplicitHighModel(categoryDefault) && match !== categoryDefault && explicitHighModel) {
    return { model: categoryDefault }
  }

  return { model: match }
}
