const subagentSessions = new Set<string>()

export function addSubagentSession(sessionID: string): void {
  subagentSessions.add(sessionID)
}

export function removeSubagentSession(sessionID: string): void {
  subagentSessions.delete(sessionID)
}

export function isSubagentSession(sessionID: string): boolean {
  return subagentSessions.has(sessionID)
}

function getSubagentSessions(): Set<string> {
  return subagentSessions
}

/** @internal For testing only */
export function resetSubagentSessionsForTesting(): void {
  subagentSessions.clear()
}
