type ModelRequirement = {
  requiresModel?: string
  requiresAnyModel?: boolean
  requiresProvider?: string[]
}

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {}
