/**
 * Boulder State Storage
 *
 * Handles reading/writing boulder.json for active plan tracking.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import type { BoulderState, TaskSessionState } from "./types"
import { BOULDER_DIR, BOULDER_FILE } from "./constants"

const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"])

export function getBoulderFilePath(directory: string): string {
  return join(directory, BOULDER_DIR, BOULDER_FILE)
}

export function readBoulderState(directory: string): BoulderState | null {
  const filePath = getBoulderFilePath(directory)

  if (!existsSync(filePath)) {
    return null
  }

  try {
    const content = readFileSync(filePath, "utf-8")
    const parsed = JSON.parse(content)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null
    }
    if (!Array.isArray(parsed.session_ids)) {
      parsed.session_ids = []
    }
    if (!parsed.session_origins || typeof parsed.session_origins !== "object" || Array.isArray(parsed.session_origins)) {
      parsed.session_origins = {}
    }
    if (parsed.session_ids.length === 1) {
      const soleSessionId = parsed.session_ids[0]
      if (
        typeof soleSessionId === "string"
        && parsed.session_origins[soleSessionId] !== "appended"
        && parsed.session_origins[soleSessionId] !== "direct"
      ) {
        parsed.session_origins[soleSessionId] = "direct"
      }
    }
    if (!parsed.task_sessions || typeof parsed.task_sessions !== "object" || Array.isArray(parsed.task_sessions)) {
      parsed.task_sessions = {}
    }
    return parsed as BoulderState
  } catch {
    return null
  }
}

export function writeBoulderState(directory: string, state: BoulderState): boolean {
  const filePath = getBoulderFilePath(directory)

  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8")
    return true
  } catch {
    return false
  }
}

export function appendSessionId(
  directory: string,
  sessionId: string,
  origin: "direct" | "appended" = "direct",
): BoulderState | null {
  const state = readBoulderState(directory)
  if (!state) return null

  if (!state.session_origins || typeof state.session_origins !== "object" || Array.isArray(state.session_origins)) {
    state.session_origins = {}
  }

  if (!state.session_ids?.includes(sessionId)) {
    if (!Array.isArray(state.session_ids)) {
      state.session_ids = []
    }
    const originalSessionIds = [...state.session_ids]
    const originalSessionOrigins = { ...state.session_origins }
    state.session_ids.push(sessionId)
    state.session_origins[sessionId] = origin
    if (writeBoulderState(directory, state)) {
      return state
    }
    state.session_ids = originalSessionIds
    state.session_origins = originalSessionOrigins
    return null
  }

  if (!state.session_origins[sessionId]) {
    state.session_origins[sessionId] = origin
    if (!writeBoulderState(directory, state)) {
      return null
    }
  }

  return state
}

export function getTaskSessionState(directory: string, taskKey: string): TaskSessionState | null {
  const state = readBoulderState(directory)
  if (!state?.task_sessions) {
    return null
  }

  return state.task_sessions[taskKey] ?? null
}

export function upsertTaskSessionState(
  directory: string,
  input: {
    taskKey: string
    taskLabel: string
    taskTitle: string
    sessionId: string
    agent?: string
    category?: string
  },
): BoulderState | null {
  const state = readBoulderState(directory)
  if (!state) {
    return null
  }

  if (RESERVED_KEYS.has(input.taskKey)) {
    return null
  }

  const taskSessions = state.task_sessions ?? {}
  taskSessions[input.taskKey] = {
    task_key: input.taskKey,
    task_label: input.taskLabel,
    task_title: input.taskTitle,
    session_id: input.sessionId,
    ...(input.agent !== undefined ? { agent: input.agent } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    updated_at: new Date().toISOString(),
  }

  state.task_sessions = taskSessions
  if (writeBoulderState(directory, state)) {
    return state
  }

  return null
}
