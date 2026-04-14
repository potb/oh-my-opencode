import { afterEach, describe, expect, mock, test } from "bun:test"

import { createChatMessageHandler } from "./chat-message"
import {
  _resetForTesting,
  setMainSession,
  subagentSessions,
} from "../features/claude-code-session-state"
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
  _resetForTesting()
  clearSessionModel("test-session")
  clearSessionModel("main-session")
  clearSessionModel("subagent-session")
})

describe("createChatMessageHandler", () => {
  test("marks the first-message gate and calls the surviving message hooks", async () => {
    const keywordHook = mock(async () => {})
    const thinkHook = mock(async () => {})
    const claudeHook = mock(async () => {})
    const noSisyphusGptHook = mock(async () => {})
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
        keywordDetector: { "chat.message": keywordHook },
        thinkMode: { "chat.message": thinkHook },
        claudeCodeHooks: { "chat.message": claudeHook },
        noSisyphusGpt: { "chat.message": noSisyphusGptHook },
      } as never,
    })

    await handler({ sessionID: "test-session", agent: "sisyphus" }, createMockOutput())

    expect(appliedSessions).toEqual(["test-session"])
    expect(keywordHook).toHaveBeenCalledTimes(1)
    expect(thinkHook).toHaveBeenCalledTimes(1)
    expect(claudeHook).toHaveBeenCalledTimes(1)
    expect(noSisyphusGptHook).toHaveBeenCalledTimes(1)
  })

  test("reuses the stored main-session model when no explicit model is provided", async () => {
    setMainSession("main-session")
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
    subagentSessions.add("subagent-session")
    setMainSession("main-session")
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
