declare const require: (name: string) => any
const { describe, expect, test } = require("bun:test")
import { getDefaultSyncPollTimeoutMs, getTimingConfig } from "./timing"

describe("timing sync poll timeout defaults", () => {
  test("default sync timeout is 30 minutes", () => {
    // #given / #when
    const timeout = getDefaultSyncPollTimeoutMs()

    // #then
    expect(timeout).toBe(30 * 60 * 1000)
  })
})

describe("WAIT_FOR_SESSION_TIMEOUT_MS default", () => {
  test("default wait for session timeout is 1 minute", () => {
    // #given / #when
    const config = getTimingConfig()

    // #then
    expect(config.WAIT_FOR_SESSION_TIMEOUT_MS).toBe(60_000)
  })
})
