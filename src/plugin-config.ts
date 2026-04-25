import type { OhMyOpenCodeConfig } from "./config"

/**
 * Single source of truth for all plugin configuration.
 * Edit values below to change behavior. Restart the plugin to apply.
 */
export const PLUGIN_CONFIG: OhMyOpenCodeConfig = {
  // -- Disable lists (populate to disable) --
  disabled_agents: [],
  disabled_hooks: [],
  disabled_tools: [],

  // -- Agent overrides (model, temperature, prompt, permissions, etc.) --
  agents: {},

  // -- Task delegation categories --
  categories: {
    "visual-engineering": { description: "Frontend, UI/UX, design, styling, animation", model: "google/gemini-3.1-pro", variant: "high" },
    "artistry": { description: "Complex problem-solving with unconventional, creative approaches", model: "google/gemini-3.1-pro", variant: "high" },
    "ultrabrain": { description: "Use ONLY for genuinely hard, logic-heavy tasks", model: "openai/gpt-5.4", variant: "xhigh" },
    "deep": { description: "Goal-oriented autonomous problem-solving with thorough research", model: "openai/gpt-5.4", variant: "medium" },
    "quick": { description: "Trivial tasks - single file changes, typo fixes", model: "openai/gpt-5.4-mini" },
    "unspecified-low": { description: "Tasks that don't fit other categories, low effort", model: "anthropic/claude-sonnet-4-6" },
    "unspecified-high": { description: "Tasks that don't fit other categories, high effort", model: "anthropic/claude-opus-4-6", variant: "max" },
    "writing": { description: "Documentation, prose, technical writing", model: "kimi-for-coding/k2p5" },
  },

  // -- Experimental feature flags --
  experimental: {
    truncate_all_tool_outputs: false,
    disable_omo_env: false,
  },

  // -- Background task engine --
  background_task: {
    defaultConcurrency: 5,
    providerConcurrency: {},
    modelConcurrency: {},
    maxDepth: 3,
    maxDescendants: 50,
    staleTimeoutMs: 2_700_000,             // 45 min
    messageStalenessTimeoutMs: 3_600_000,  // 60 min
    taskTtlMs: 1_800_000,                  // 30 min
    sessionGoneTimeoutMs: 60_000,          // 1 min
    syncPollTimeoutMs: 600_000,            // 10 min
    maxToolCalls: 4000,
    circuitBreaker: { enabled: true, maxToolCalls: 4000, consecutiveThreshold: 20 },
  },

  // -- Git skill --
  git_master: {
    commit_footer: true,
    include_co_authored_by: true,
    git_env_prefix: "GIT_MASTER=1",
  },

  // -- Browser automation --
  browser_automation_engine: { provider: "agent-browser" },
}
