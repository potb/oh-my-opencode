import type { AgentConfig } from "@opencode-ai/sdk"

type PermissionValue = "ask" | "allow" | "deny"

type BashPermission = PermissionValue | Record<string, PermissionValue>

export interface AgentPermission {
  edit?: PermissionValue
  bash?: BashPermission
  webfetch?: PermissionValue
  task?: PermissionValue
  doom_loop?: PermissionValue
  external_directory?: PermissionValue
}

export type AgentName =
  | "sisyphus"
  | "oracle"
  | "librarian"
  | "explore"
  | "metis"
  | "momus"
  | "sisyphus-junior"

interface AgentThinkingConfig {
  type: "enabled" | "disabled"
  budgetTokens?: number
}

interface AgentModelOverrideConfig {
  model?: string
  variant?: string
}

export type AgentOverrideConfig = Partial<AgentConfig> & {
  variant?: string
  /** Category name to inherit model and other settings from CategoryConfig */
  category?: string
  /** Skill names to inject into agent prompt */
  skills?: string[]
  temperature?: number
  top_p?: number
  prompt?: string
  /** Text to append to agent prompt. Supports file:// URIs (file:///abs, file://./rel, file://~/home) */
  prompt_append?: string
  disable?: boolean
  description?: string
  mode?: "subagent" | "primary" | "all"
  color?: string
  permission?: AgentPermission
  /** Maximum tokens for response. Passed directly to OpenCode SDK. */
  maxTokens?: number
  /** Extended thinking configuration (Anthropic). Overrides category and default settings. */
  thinking?: AgentThinkingConfig
  /** Reasoning effort level (OpenAI). Overrides category and default settings. */
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh"
  /** Text verbosity level. */
  textVerbosity?: "low" | "medium" | "high"
  /** Provider-specific options. Passed directly to OpenCode SDK. */
  providerOptions?: Record<string, unknown>
  compaction?: AgentModelOverrideConfig
}

export interface AgentOverrides {
  plan?: AgentOverrideConfig
  sisyphus?: AgentOverrideConfig
  "sisyphus-junior"?: AgentOverrideConfig
  metis?: AgentOverrideConfig
  momus?: AgentOverrideConfig
  oracle?: AgentOverrideConfig
  librarian?: AgentOverrideConfig
  explore?: AgentOverrideConfig
}

interface CircuitBreakerConfig {
  enabled: boolean
  maxToolCalls: number
  consecutiveThreshold: number
}

export interface BackgroundTaskConfig {
  defaultConcurrency: number
  providerConcurrency: Record<string, number>
  modelConcurrency: Record<string, number>
  maxDepth: number
  maxDescendants: number
  /** Stale timeout in milliseconds. Actual value set in src/plugin-config.ts. */
  staleTimeoutMs: number
  /** Timeout for tasks that never received any progress update. Actual value set in src/plugin-config.ts. */
  messageStalenessTimeoutMs: number
  /** Absolute TTL for non-terminal tasks in milliseconds. Actual value set in src/plugin-config.ts. */
  taskTtlMs: number
  /** Timeout for tasks whose session has disappeared from the status registry. Actual value set in src/plugin-config.ts. */
  sessionGoneTimeoutMs: number
  syncPollTimeoutMs: number
  /** Maximum tool calls per subagent task before circuit breaker triggers. Actual value set in src/plugin-config.ts. */
  maxToolCalls: number
  circuitBreaker: CircuitBreakerConfig
}

export type BrowserAutomationProvider = "agent-browser"

export interface BrowserAutomationConfig {
  /**
   * Browser automation provider to use for the browser skill.
   * - "agent-browser": Uses agent-browser CLI
   */
  provider: BrowserAutomationProvider
}

interface CategoryThinkingConfig {
  type: "enabled" | "disabled"
  budgetTokens?: number
}

export interface CategoryConfig {
  /** Human-readable description of the category's purpose. Shown in task prompt. */
  description: string
  model?: string
  variant?: string
  temperature?: number
  top_p?: number
  maxTokens?: number
  thinking?: CategoryThinkingConfig
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh"
  textVerbosity?: "low" | "medium" | "high"
  tools?: Record<string, boolean>
  prompt_append?: string
  max_prompt_tokens?: number
  /** Mark agent as unstable - forces background mode for monitoring. Auto-enabled for gemini/minimax models. */
  is_unstable_agent?: boolean
  /** Disable this category. Disabled categories are excluded from task delegation. */
  disable?: boolean
}

export type CategoriesConfig = Record<string, CategoryConfig>

interface DynamicContextPruningTurnProtectionConfig {
  enabled: boolean
  turns: number
}

interface DynamicContextPruningDeduplicationConfig {
  enabled: boolean
}

interface DynamicContextPruningSupersedeWritesConfig {
  enabled: boolean
  aggressive: boolean
}

interface DynamicContextPruningPurgeErrorsConfig {
  enabled: boolean
  turns: number
}

interface DynamicContextPruningStrategiesConfig {
  deduplication?: DynamicContextPruningDeduplicationConfig
  supersede_writes?: DynamicContextPruningSupersedeWritesConfig
  purge_errors?: DynamicContextPruningPurgeErrorsConfig
}

export interface DynamicContextPruningConfig {
  enabled: boolean
  notification: "off" | "minimal" | "detailed"
  /** Turn protection - prevent pruning recent tool outputs */
  turn_protection?: DynamicContextPruningTurnProtectionConfig
  /** Tools that should never be pruned */
  protected_tools: string[]
  /** Pruning strategies configuration */
  strategies?: DynamicContextPruningStrategiesConfig
}

export interface ExperimentalConfig {
  truncate_all_tool_outputs?: boolean
  /** Dynamic context pruning configuration */
  dynamic_context_pruning?: DynamicContextPruningConfig
  /** Disable auto-injected <omo-env> context in prompts (experimental) */
  disable_omo_env?: boolean
  /** Maximum number of tools to register. When set, lower-priority tools are excluded to stay within provider limits (e.g., OpenAI's 128-tool cap). Accounts for ~20 OpenCode built-in tools. */
  max_tools?: number
}

export type GitEnvPrefix = string

export interface GitMasterConfig {
  /** Add a footer to commit messages. Can be boolean or custom string. */
  commit_footer: boolean | string
  /** Add "Co-authored-by: Sisyphus" trailer to commit messages. */
  include_co_authored_by: boolean
  /** Environment variable prefix for all git commands (default: "GIT_MASTER=1"). Set to "" to disable. Allows custom git hooks to detect git-master skill usage. */
  git_env_prefix: GitEnvPrefix
}

export type HookName =
  | "tool-output-truncator"
  | "question-label-truncator"
  | "non-interactive-env"
  | "interactive-bash-session"
  | "sisyphus-junior-notepad"
  | "write-existing-file-guard"
  | "anthropic-effort"
  | "webfetch-redirect-guard"

export interface OhMyOpenCodeConfig {
  disabled_agents: string[]
  disabled_hooks: string[]
  /** Disable specific tools by name (e.g., ["todowrite", "todoread"]) */
  disabled_tools: string[]
  agents: AgentOverrides
  categories: CategoriesConfig
  experimental: ExperimentalConfig
  background_task: BackgroundTaskConfig
  git_master: GitMasterConfig
  browser_automation_engine: BrowserAutomationConfig
}
