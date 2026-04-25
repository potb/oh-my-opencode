import type { PluginInput } from "@opencode-ai/plugin"
import type { BackgroundManager } from "../../features/background-agent"
import type { GitMasterConfig, BrowserAutomationProvider, AgentOverrides } from "../../config"
import type {
  AvailableCategory,
  AvailableSkill,
} from "../../agents/dynamic-agent-prompt-builder"

export type OpencodeClient = PluginInput["client"]

type SisyphusAgentConfig = {
  disabled?: boolean
  default_builder_enabled?: boolean
  planner_enabled?: boolean
  replace_plan?: boolean
  tdd?: boolean
}

export interface DelegateTaskArgs {
  description: string
  prompt: string
  subagent_type?: string
  run_in_background: boolean
  session_id?: string
  command?: string
  execute?: {
    task_id: string
    task_dir?: string
  }
}

export interface ToolContextWithMetadata {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void | Promise<void>
  /**
   * Tool call ID injected by OpenCode's internal context (not in plugin ToolContext type,
   * but present at runtime via spread in fromPlugin()). Used for metadata store keying.
   */
  callID?: string
}

export interface SyncSessionCreatedEvent {
  sessionID: string
  parentID: string
  title: string
}

export interface DelegateTaskToolOptions {
  manager: BackgroundManager
  client: OpencodeClient
  directory: string
  /**
   * Test hook: bypass global cache reads (Bun runs tests in parallel).
   * If provided, resolveCategoryExecution/resolveSubagentExecution uses this instead of reading from disk cache.
   */
  connectedProvidersOverride?: string[] | null
  /**
   * Test hook: bypass fetchAvailableModels() by providing an explicit available model set.
   */
  availableModelsOverride?: Set<string>
  gitMasterConfig?: GitMasterConfig
  sisyphusJuniorModel?: string
  browserProvider?: BrowserAutomationProvider
  disabledSkills?: Set<string>
  availableCategories?: AvailableCategory[]
  availableSkills?: AvailableSkill[]
  agentOverrides?: AgentOverrides
  sisyphusAgentConfig?: SisyphusAgentConfig
  onSyncSessionCreated?: (event: SyncSessionCreatedEvent) => Promise<void>
  syncPollTimeoutMs?: number
}

import type { DelegatedModelConfig } from "../../shared/model-resolution-types"
export type { DelegatedModelConfig }

export interface BuildSystemContentInput {
  skillContent?: string
  skillContents?: string[]
  categoryPromptAppend?: string
  agentsContext?: string
  planAgentPrepend?: string
  maxPromptTokens?: number
  model?: DelegatedModelConfig
  agentName?: string
  availableCategories?: AvailableCategory[]
  availableSkills?: AvailableSkill[]
}
