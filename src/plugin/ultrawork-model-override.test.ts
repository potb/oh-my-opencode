import { describe, expect, test, beforeEach, afterEach, spyOn } from "bun:test"
import * as sharedModule from "../shared"
import * as dbOverrideModule from "./ultrawork-db-model-override"

let resolveUltraworkOverride: (typeof import("./ultrawork-model-override"))["resolveUltraworkOverride"]
let detectUltrawork: (typeof import("./ultrawork-model-override"))["detectUltrawork"]
let applyUltraworkModelOverrideOnMessage: (typeof import("./ultrawork-model-override"))["applyUltraworkModelOverrideOnMessage"]

async function importFreshUltraworkModelOverrideModule(): Promise<typeof import("./ultrawork-model-override")> {
  return import(`./ultrawork-model-override?test=${Date.now()}-${Math.random()}`)
}

async function loadFreshUltraworkModelOverrideModule(): Promise<void> {
  ;({
    resolveUltraworkOverride,
    detectUltrawork,
    applyUltraworkModelOverrideOnMessage,
  } = await importFreshUltraworkModelOverrideModule())
}

describe("detectUltrawork", () => {
  beforeEach(async () => {
    await loadFreshUltraworkModelOverrideModule()
  })

  test("should detect ultrawork keyword", () => {
    expect(detectUltrawork("ultrawork do something")).toBe(true)
  })

  test("should detect ulw keyword", () => {
    expect(detectUltrawork("ulw fix the bug")).toBe(true)
  })

  test("should be case insensitive", () => {
    expect(detectUltrawork("ULTRAWORK do something")).toBe(true)
  })

  test("should not detect in code blocks", () => {
    const textWithCodeBlock = [
      "check this:",
      "```",
      "ultrawork mode",
      "```",
    ].join("\n")
    expect(detectUltrawork(textWithCodeBlock)).toBe(false)
  })

  test("should not detect in inline code", () => {
    expect(detectUltrawork("the `ultrawork` mode is cool")).toBe(false)
  })

  test("should not detect when keyword absent", () => {
    expect(detectUltrawork("just do something normal")).toBe(false)
  })
})

describe("resolveUltraworkOverride", () => {
  beforeEach(async () => {
    await loadFreshUltraworkModelOverrideModule()
  })

  function createOutput(text: string, agentName?: string) {
    return {
      message: {
        ...(agentName ? { agent: agentName } : {}),
      } as Record<string, unknown>,
      parts: [{ type: "text", text }],
    }
  }

  function createConfig(agentName: string, ultrawork: { model?: string; variant?: string }) {
    return {
      agents: {
        [agentName]: { ultrawork },
      },
    } as unknown as Parameters<typeof resolveUltraworkOverride>[0]
  }

  test("should resolve override when ultrawork keyword detected", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-6", variant: "max" })
  })

  test("should return null when no keyword detected", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("just do something normal")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should return null when agent name is undefined", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, undefined, output)

    //#then
    expect(result).toBeNull()
  })

  test("should use message.agent when input agent is undefined", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("ultrawork do something", "sisyphus")

    //#when
    const result = resolveUltraworkOverride(config, undefined, output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-6", variant: undefined })
  })

  test("should return null when agents config is missing", () => {
    //#given
    const config = {} as Parameters<typeof resolveUltraworkOverride>[0]
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should return null when agent has no ultrawork config", () => {
    //#given
    const config = {
      agents: { sisyphus: { model: "anthropic/claude-sonnet-4-6" } },
    } as unknown as Parameters<typeof resolveUltraworkOverride>[0]
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should resolve variant-only override when ultrawork.model is not set", () => {
    //#given
    const config = createConfig("sisyphus", { variant: "max" })
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toEqual({ variant: "max" })
  })

  test("should handle model string with multiple slashes", () => {
    //#given
    const config = createConfig("sisyphus", { model: "openai/gpt-5.3/codex" })
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toEqual({ providerID: "openai", modelID: "gpt-5.3/codex", variant: undefined })
  })

  test("should return null when model string has no slash", () => {
    //#given
    const config = createConfig("sisyphus", { model: "just-a-model" })
    const output = createOutput("ultrawork do something")

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should resolve display name to config key", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ulw do something")

    //#when
    const result = resolveUltraworkOverride(config, "Sisyphus - Ultraworker", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-6", variant: "max" })
  })

  test("should handle multiple text parts by joining them", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = {
      message: {} as Record<string, unknown>,
      parts: [
        { type: "text", text: "hello " },
        { type: "image", text: undefined },
        { type: "text", text: "ultrawork now" },
      ],
    }

    //#when
    const result = resolveUltraworkOverride(config, "sisyphus", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-6", variant: undefined })
  })

})

describe("applyUltraworkModelOverrideOnMessage", () => {
  let logSpy: ReturnType<typeof spyOn>
  let dbOverrideSpy: ReturnType<typeof spyOn>

  beforeEach(async () => {
    logSpy = spyOn(sharedModule, "log")
    logSpy.mockImplementation(() => {})
    dbOverrideSpy = spyOn(dbOverrideModule, "scheduleDeferredModelOverride")
    dbOverrideSpy.mockImplementation(() => {})
    await loadFreshUltraworkModelOverrideModule()
  })

  afterEach(() => {
    logSpy?.mockRestore()
    dbOverrideSpy?.mockRestore()
  })

  function createMockTui() {
    return {
      showToast: async () => {},
    }
  }

  function createOutput(
    text: string,
    options?: {
      existingModel?: { providerID: string; modelID: string }
      agentName?: string
      messageId?: string
    },
  ) {
    return {
      message: {
        ...(options?.existingModel ? { model: options.existingModel } : {}),
        ...(options?.agentName ? { agent: options.agentName } : {}),
        ...(options?.messageId ? { id: options.messageId } : {}),
      } as Record<string, unknown>,
      parts: [{ type: "text", text }],
    }
  }

  function createConfig(agentName: string, ultrawork: { model?: string; variant?: string }) {
    return {
      agents: {
        [agentName]: { ultrawork },
      },
    } as unknown as Parameters<typeof applyUltraworkModelOverrideOnMessage>[0]
  }

  test("should throw when SDK validation is unavailable", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ultrawork do something", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should preserve existing variant while throwing when SDK unavailable", () => {
    //#given
    const config = createConfig("sisyphus", {
      model: "anthropic/claude-opus-4-6",
      variant: "extended",
    })
    const output = createOutput("ultrawork do something", { messageId: "msg_123" })
    output.message["variant"] = "max"
    output.message["thinking"] = "max"
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(dbOverrideSpy).not.toHaveBeenCalled()
    expect(output.message["variant"]).toBe("max")
    expect(output.message["thinking"]).toBe("max")
  })

  test("should not mutate output.message.model when SDK validation is unavailable", () => {
    //#given
    const sonnetModel = { providerID: "anthropic", modelID: "claude-sonnet-4-6" }
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("ultrawork do something", {
      existingModel: sonnetModel,
      messageId: "msg_123",
    })
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(output.message.model).toEqual(sonnetModel)
  })

  test("should throw when no message ID and no SDK", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ultrawork do something")
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(output.message.model).toBeUndefined()
    expect(output.message["variant"]).toBeUndefined()
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should throw for variant-only override when no SDK available", () => {
    //#given
    const config = createConfig("sisyphus", { variant: "high" })
    const output = createOutput("ultrawork do something")
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(output.message.model).toBeUndefined()
    expect(output.message["variant"]).toBeUndefined()
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should not apply override when no keyword detected", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("just do something normal", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when
    applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)

    //#then
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should throw before logging a skipped ultrawork override when SDK validation is unavailable", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const existingModel = { providerID: "anthropic", modelID: "claude-sonnet-4-6" }
    const output = createOutput("ultrawork do something", {
      existingModel,
      messageId: "msg_123",
    })
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
  })

  test("should not call showToast when ultrawork override throws", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6" })
    const output = createOutput("ultrawork do something", { messageId: "msg_123" })
    let toastCalled = false
    const tui = {
      showToast: async () => {
        toastCalled = true
      },
    }

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(toastCalled).toBe(false)
  })

  test("should resolve display name to config key but still throw without SDK validation", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ulw do something", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "Sisyphus - Ultraworker", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should throw before applying override when current model already matches but SDK validation is unavailable", () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ultrawork do something", {
      existingModel: { providerID: "anthropic", modelID: "claude-opus-4-6" },
      messageId: "msg_123",
    })
    let toastCalled = false
    const tui = {
      showToast: async () => {
        toastCalled = true
      },
    }

    //#when / #then
    expect(() => applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui)).toThrow(
      "SDK validation unavailable for ultrawork override"
    )
    expect(dbOverrideSpy).not.toHaveBeenCalled()
    expect(toastCalled).toBe(false)
  })

  test("should apply validated variant when SDK confirms model supports it", async () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-opus-4-6", variant: "max" })
    const output = createOutput("ultrawork do something", { messageId: "msg_123" })
    const tui = createMockTui()
    const mockClient = {
      provider: {
        list: async () => ({
          data: { all: [{ id: "anthropic", models: { "claude-opus-4-6": { variants: { max: {} } } } }] },
        }),
      },
    }

    //#when
    await applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui, undefined, mockClient)

    //#then - SDK confirmed max exists, so variant is applied
    expect(dbOverrideSpy).toHaveBeenCalledWith(
      "msg_123",
      { providerID: "anthropic", modelID: "claude-opus-4-6" },
      "max",
    )
  })

  test("should NOT apply variant when SDK confirms model does NOT have it", async () => {
    //#given
    const config = createConfig("sisyphus", { model: "anthropic/claude-haiku-4-5", variant: "max" })
    const output = createOutput("ultrawork do something", { messageId: "msg_123" })
    const tui = createMockTui()
    const mockClient = {
      provider: {
        list: async () => ({
          data: { all: [{ id: "anthropic", models: { "claude-haiku-4-5": { variants: { high: {} } } } }] },
        }),
      },
    }

    //#when
    await applyUltraworkModelOverrideOnMessage(config, "sisyphus", output, tui, undefined, mockClient)

    //#then - SDK says haiku has no max variant, so variant is NOT applied
    expect(output.message["variant"]).toBeUndefined()
  })
})
