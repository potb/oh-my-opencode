export function normalizeModelFormat(
  model: { providerID: string; modelID: string } | null | undefined
): { providerID: string; modelID: string } | undefined {
  if (!model) {
    return undefined
  }

  if (typeof model === "object" && "providerID" in model && "modelID" in model) {
    return { providerID: model.providerID, modelID: model.modelID }
  }

  return undefined
}
