export const AGENT_NAME_MAP: Record<string, string> = {
  // Sisyphus variants → "sisyphus"
  omo: "sisyphus",
  OmO: "sisyphus",
  Sisyphus: "sisyphus",
  "Sisyphus (Ultraworker)": "sisyphus",
  sisyphus: "sisyphus",

  // Metis variants → "metis"
  "plan-consultant": "metis",
  "Metis - Plan Consultant": "metis",
  "Metis (Plan Consultant)": "metis",
  metis: "metis",

  // Momus variants → "momus"
  "Momus - Plan Critic": "momus",
  "Momus (Plan Critic)": "momus",
  momus: "momus",

  // Sisyphus-Junior → "sisyphus-junior"
  "Sisyphus-Junior": "sisyphus-junior",
  "sisyphus-junior": "sisyphus-junior",

  // Already lowercase - passthrough
  oracle: "oracle",
  librarian: "librarian",
  explore: "explore",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "sisyphus", // was "Sisyphus"
  "oracle",
  "librarian",
  "explore",
  "metis", // was "Metis - Plan Consultant"
  "momus", // was "Momus - Plan Critic"
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
