declare const require: (name: string) => any
const { describe, expect, test, mock } = require("bun:test")

import { checkAndInterruptStaleTasks } from "./task-poller"
import { createBackgroundTaskConfig } from "./test-config"
import type { BackgroundTask } from "./types"

function createRunningTask(startedAt: Date): BackgroundTask {
  return {
    id: "task-1",
    sessionID: "ses-1",
    parentSessionID: "parent-ses-1",
    parentMessageID: "msg-1",
    description: "test",
    prompt: "test",
    agent: "explore",
    status: "running",
    startedAt,
    progress: undefined,
  }
}

describe("background_task.messageStalenessTimeoutMs", () => {
  test("uses a 60 minute configured default", () => {
    // #given
    const expectedTimeout = 60 * 60 * 1000

    // #when
    const timeout = createBackgroundTaskConfig().messageStalenessTimeoutMs

    // #then
    expect(timeout).toBe(expectedTimeout)
  })

  test("does not interrupt a never-updated task after 15 minutes with the configured timeout", async () => {
    // #given
    const task = createRunningTask(new Date(Date.now() - 15 * 60 * 1000))
    const client = {
      session: {
        abort: mock(() => Promise.resolve()),
      },
    }
    const concurrencyManager = {
      release: mock(() => {}),
    }
    const notifyParentSession = mock(() => Promise.resolve())

    // #when
    await checkAndInterruptStaleTasks({
      tasks: [task],
      client: client as never,
      config: createBackgroundTaskConfig(),
      concurrencyManager: concurrencyManager as never,
      notifyParentSession,
    })

    // #then
    expect(task.status).toBe("running")
  })
})
