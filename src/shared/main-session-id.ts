let mainSessionID: string | undefined

export function setMainSessionID(sessionID: string | undefined): void {
  mainSessionID = sessionID
}

export function getMainSessionID(): string | undefined {
  return mainSessionID
}

/** @internal For testing only */
export function resetMainSessionIDForTesting(): void {
  mainSessionID = undefined
}
