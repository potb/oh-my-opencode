import type { PluginInput } from "@opencode-ai/plugin"
import type { BackgroundTask, LaunchInput } from "./types"


const MIN_STABILITY_TIME_MS = 10 * 1000
export const MIN_RUNTIME_BEFORE_STALE_MS = 30_000
export const MIN_IDLE_TIME_MS = 5000
export const POLLING_INTERVAL_MS = 3000
export const TASK_CLEANUP_DELAY_MS = 10 * 60 * 1000
const TMUX_CALLBACK_DELAY_MS = 200

type ProcessCleanupEvent = NodeJS.Signals | "beforeExit" | "exit"

export type OpencodeClient = PluginInput["client"]

interface MessagePartInfo {
  sessionID?: string
  type?: string
  tool?: string
}

interface EventProperties {
  sessionID?: string
  info?: { id?: string }
  [key: string]: unknown
}

interface BackgroundEvent {
  type: string
  properties?: EventProperties
}

interface Todo {
  content: string;
  status: string;
  priority: string;
  id?: string;
}

export interface QueueItem {
  task: BackgroundTask
  input: LaunchInput
}

interface SubagentSessionCreatedEvent {
  sessionID: string
  parentID: string
  title: string
}

type OnSubagentSessionCreated = (event: SubagentSessionCreatedEvent) => Promise<void>
