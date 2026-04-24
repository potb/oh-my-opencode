import { afterEach, describe, expect, it } from "bun:test"

import { clearSessionModel, getSessionModel, setSessionModel } from "../shared/session-model-state"
import { clearSessionPromptParams } from "../shared/session-prompt-params-state"
import { resetMainSessionIDForTesting } from "../shared/main-session-id"
import { resetSubagentSessionsForTesting } from "../shared/subagent-session-registry"
import { createEventHandler } from "./event"

function createMinimalEventHandler() {
  return createEventHandler({
    ctx: {} as never,
    pluginConfig: {} as never,
    firstMessageVariantGate: {
      markSessionCreated: () => {},
      clear: () => {},
    },
    managers: {
      tmuxSessionManager: {
        onSessionCreated: async () => {},
        onSessionDeleted: async () => {},
      },
      skillMcpManager: {
        disconnectSession: async () => {},
      },
    } as never,
    hooks: {
      autoUpdateChecker: { event: async () => {} },
      contextWindowMonitor: { event: async () => {} },
      thinkMode: { event: async () => {} },
      interactiveBashSession: { event: async () => {} },
      writeExistingFileGuard: { event: async () => {} },
    } as never,
  })
}

describe("createEventHandler compaction agent filtering", () => {
  afterEach(() => {
    resetMainSessionIDForTesting()
    resetSubagentSessionsForTesting()
    clearSessionModel("ses_compaction_poisoning")
    clearSessionModel("ses_compaction_model_poisoning")
    clearSessionPromptParams("ses_compaction_poisoning")
    clearSessionPromptParams("ses_compaction_model_poisoning")
  })

  it("does not overwrite the stored session model with compaction", async () => {
    // given
    const sessionID = "ses_compaction_model_poisoning"
    setSessionModel(sessionID, { providerID: "openai", modelID: "gpt-5" })
    const eventHandler = createMinimalEventHandler()
    const input: Parameters<ReturnType<typeof createEventHandler>>[0] = {
      event: {
        type: "message.updated",
        properties: {
          info: {
            id: "msg-compaction-model",
            sessionID,
            role: "user",
            agent: "compaction",
            model: { providerID: "anthropic", modelID: "claude-opus-4-1" },
            time: { created: Date.now() },
          },
        },
      },
    }

    // when
    await eventHandler(input)

    // then
    expect(getSessionModel(sessionID)).toEqual({
      providerID: "openai",
      modelID: "gpt-5",
    })
  })
})
