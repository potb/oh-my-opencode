/**
 * Agent config keys to display names mapping.
 * Config keys are lowercase (e.g., "sisyphus").
 * Display names may include suffixes for UI/logs (e.g., "Metis - Plan Consultant").
 *
 * IMPORTANT: Display names MUST NOT contain parentheses or other characters
 * that are invalid in HTTP header values per RFC 7230. OpenCode passes the
 * agent name in the `x-opencode-agent-name` header, and parentheses cause
 * header validation failures that prevent agents from appearing in the UI
 * type selector dropdown. Use ` - ` (space-dash-space) instead of `(...)`.
 */
const AGENT_DISPLAY_NAMES: Record<string, string> = {
  sisyphus: "Sisyphus",
  "sisyphus-junior": "Sisyphus-Junior",
  metis: "Metis - Plan Consultant",
  momus: "Momus - Plan Critic",
  oracle: "oracle",
  librarian: "librarian",
  explore: "explore",
}

const AGENT_LIST_SORT_PREFIXES: Record<string, string> = {
  sisyphus: "\u200B",
}

const INVISIBLE_AGENT_CHARACTERS_REGEX = /[\u200B\u200C\u200D\uFEFF]/g

function stripInvisibleAgentCharacters(agentName: string): string {
  return agentName.replace(INVISIBLE_AGENT_CHARACTERS_REGEX, "")
}

export function stripAgentListSortPrefix(agentName: string): string {
  return stripInvisibleAgentCharacters(agentName)
}

export function getAgentRuntimeName(configKey: string): string {
  const displayName = getAgentDisplayName(configKey)
  const prefix = AGENT_LIST_SORT_PREFIXES[configKey.toLowerCase()]

  return prefix ? `${prefix}${displayName}` : displayName
}

/**
 * Get display name for an agent config key.
 * Returns original key if not found.
 */
export function getAgentDisplayName(configKey: string): string {
  const exactMatch = AGENT_DISPLAY_NAMES[configKey]
  if (exactMatch !== undefined) return exactMatch

  return configKey
}

/**
 * Runtime-facing agent name used for OpenCode list ordering.
 */
export function getAgentListDisplayName(configKey: string): string {
  return getAgentRuntimeName(configKey)
}

const REVERSE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(AGENT_DISPLAY_NAMES).map(([key, displayName]) => [displayName.toLowerCase(), key]),
)

function resolveKnownAgentConfigKey(agentName: string): string | undefined {
  const lower = stripAgentListSortPrefix(agentName).trim().toLowerCase()
  const reversed = REVERSE_DISPLAY_NAMES[lower]
  if (reversed !== undefined) return reversed
  if (AGENT_DISPLAY_NAMES[lower] !== undefined) return lower
  return undefined
}

/**
 * Resolve an agent name (display name or config key) to its lowercase config key.
 * Known display names and config keys resolve to lowercase config keys.
 */
export function getAgentConfigKey(agentName: string): string {
  const lower = stripAgentListSortPrefix(agentName).trim().toLowerCase()
  return resolveKnownAgentConfigKey(agentName) ?? lower
}

/**
 * Normalize an agent name for prompt APIs.
 * - Known display names -> canonical display names
 * - Known config keys (any case) -> canonical display names
 * - Unknown/custom names -> preserved as-is (trimmed)
 */
