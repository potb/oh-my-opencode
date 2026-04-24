import { afterEach, describe, expect, mock, test } from "bun:test"

import { createChatMessageHandler } from "./chat-message"
import { resetMainSessionIDForTesting, setMainSessionID } from "../shared/main-session-id"
import {
  addSubagentSession,
  resetSubagentSessionsForTesting,
} from "../shared/subagent-session-registry"
import { clearSessionModel, getSessionModel, setSessionModel } from "../shared/session-model-state"

type ChatMessagePart = { type: string; text?: string; [key: string]: unknown }
type ChatMessageHandlerOutput = { message: Record<string, unknown>; parts: ChatMessagePart[] }

function createMockOutput(): ChatMessageHandlerOutput {
  return {
    message: {},
    parts: [{ type: "text", text: "hello" }],
  }
}

afterEach(() => {
  resetMainSessionIDForTesting()
  resetSubagentSessionsForTesting()
  clearSessionModel("test-session")
  clearSessionModel("main-session")
  clearSessionModel("subagent-session")
})

describe("createChatMessageHandler", () => {
  test("marks the first-message gate and calls the remaining message hooks", async () => {
    const thinkHook = mock(async () => {})
    const appliedSessions: string[] = []

    const handler = createChatMessageHandler({
      ctx: { client: { tui: { showToast: async () => {} } } } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => true,
        markApplied: (sessionID: string) => {
          appliedSessions.push(sessionID)
        },
      },
      hooks: {
        thinkMode: { "chat.message": thinkHook },
      } as never,
    })

    await handler({ sessionID: "test-session", agent: "sisyphus" }, createMockOutput())

    expect(appliedSessions).toEqual(["test-session"])
    expect(thinkHook).toHaveBeenCalledTimes(1)
  })

  test("reuses the stored main-session model when no explicit model is provided", async () => {
    setMainSessionID("main-session")
    setSessionModel("main-session", { providerID: "openai", modelID: "gpt-5.4" })

    const handler = createChatMessageHandler({
      ctx: { client: { tui: { showToast: async () => {} } } } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
      },
      hooks: {} as never,
    })

    const output = createMockOutput()
    await handler({ sessionID: "main-session", agent: "sisyphus" }, output)

    expect(output.message.model).toEqual({ providerID: "openai", modelID: "gpt-5.4" })
  })

  test("stores the explicit input model for the session", async () => {
    const handler = createChatMessageHandler({
      ctx: { client: { tui: { showToast: async () => {} } } } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
      },
      hooks: {} as never,
    })

    await handler(
      {
        sessionID: "test-session",
        agent: "sisyphus",
        model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
      },
      createMockOutput(),
    )

    expect(getSessionModel("test-session")).toEqual({
      providerID: "anthropic",
      modelID: "claude-opus-4-6",
    })
  })

  test("does not reuse the stored model for subagent sessions", async () => {
    addSubagentSession("subagent-session")
    setMainSessionID("main-session")
    setSessionModel("subagent-session", { providerID: "openai", modelID: "gpt-5.4" })

    const handler = createChatMessageHandler({
      ctx: { client: { tui: { showToast: async () => {} } } } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
      },
      hooks: {} as never,
    })

    const output = createMockOutput()
    await handler({ sessionID: "subagent-session", agent: "explore" }, output)

    expect(output.message.model).toBeUndefined()
  })

})
