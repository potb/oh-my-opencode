import { resolveModelPipeline } from "../../shared"

export function applyModelResolution(input: {
  uiSelectedModel?: string
  userModel?: string
  availableModels: Set<string>
}) {
  const { uiSelectedModel, userModel, availableModels } = input
  return resolveModelPipeline({
    intent: { uiSelectedModel, userModel },
    constraints: { availableModels },
  })
}
