import type { OhMyOpenCodeConfig } from "./config"

export const FIXED_PRODUCT_AGENT_NAMES = [
  "sisyphus",
  "sisyphus-junior",
  "explore",
  "librarian",
  "metis",
  "momus",
  "oracle",
] as const

export const REMOVED_AGENT_NAMES = [
  "atlas",
  "hephaestus",
] as const

const REMOVED_TOOL_NAMES = [
  "background_cancel",
  "background_output",
  "interactive_bash",
  "session_info",
  "session_list",
  "session_read",
  "session_search",
  "skill",
  "skill_mcp",
  "task_create",
  "task_get",
  "task_list",
  "task_update",
] as const

const REMOVED_HOOK_NAMES = [
  "atlas",
  "auto-slash-command",
  "category-skill-reminder",
  "interactive-bash-session",
  "no-hephaestus-non-gpt",
  "runtime-fallback",
  "start-work",
  "stop-continuation-guard",
] as const

function mergeUnique<T extends string>(existing: readonly T[] | undefined, additions: readonly T[]): T[] {
  return Array.from(new Set([...(existing ?? []), ...additions]))
}

export function applyFixedProductTrim(config: OhMyOpenCodeConfig): OhMyOpenCodeConfig {
  const {
    agents: _agents,
    categories: _categories,
    auto_update: _autoUpdate,
    babysitting: _babysitting,
    model_capabilities: _modelCapabilities,
    notification: _notification,
    sisyphus_agent: _sisyphusAgent,
    skills: _skills,
    ...rest
  } = config as OhMyOpenCodeConfig & Record<string, unknown>

  return {
    ...rest,
    agents: undefined,
    categories: undefined,
    claude_code: {
      ...config.claude_code,
      agents: false,
      commands: false,
      hooks: false,
      mcp: false,
      plugins: false,
      plugins_override: undefined,
      skills: false,
    },
    disabled_agents: mergeUnique(config.disabled_agents, REMOVED_AGENT_NAMES),
    disabled_hooks: mergeUnique(config.disabled_hooks, REMOVED_HOOK_NAMES),
    disabled_tools: mergeUnique(config.disabled_tools, REMOVED_TOOL_NAMES),
    new_task_system_enabled: false,
  }
}
