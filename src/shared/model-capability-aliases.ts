type ModelIDAliasResolution = {
  requestedModelID: string
  canonicalModelID: string
  source: "canonical"
}

function normalizeLookupModelID(modelID: string): string {
  return modelID.trim().toLowerCase()
}

export function resolveModelIDAlias(modelID: string): ModelIDAliasResolution {
  const requestedModelID = normalizeLookupModelID(modelID)

  return {
    requestedModelID,
    canonicalModelID: requestedModelID,
    source: "canonical",
  }
}
