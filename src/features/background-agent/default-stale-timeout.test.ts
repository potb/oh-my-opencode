declare const require: (name: string) => any
const { describe, expect, test } = require("bun:test")

import { createBackgroundTaskConfig } from "./test-config"

describe("background_task.staleTimeoutMs", () => {
  test("uses a 45 minute configured default", () => {
    // #given
    const expectedTimeout = 45 * 60 * 1000

    // #when
    const timeout = createBackgroundTaskConfig().staleTimeoutMs

    // #then
    expect(timeout).toBe(expectedTimeout)
  })
})
