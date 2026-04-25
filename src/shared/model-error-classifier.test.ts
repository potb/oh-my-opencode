declare const require: (name: string) => any
const { describe, expect, test, beforeEach, afterEach, spyOn } = require("bun:test")
import * as connectedProvidersCache from "./connected-providers-cache"

let readConnectedProvidersCacheSpy: ReturnType<typeof spyOn> | undefined
const { selectFallbackProvider } = await import("./model-error-classifier")

describe("model-error-classifier", () => {
  beforeEach(() => {
    readConnectedProvidersCacheSpy?.mockRestore()
    readConnectedProvidersCacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
  })

  afterEach(() => {
    readConnectedProvidersCacheSpy?.mockRestore()
    readConnectedProvidersCacheSpy = undefined
  })

  test("selectFallbackProvider prefers first connected provider in preference order", () => {
    //#given
    readConnectedProvidersCacheSpy?.mockReturnValue(["anthropic", "nvidia"])

    //#when
    const provider = selectFallbackProvider(["anthropic", "nvidia"], "nvidia")

    //#then
    expect(provider).toBe("anthropic")
  })

  test("selectFallbackProvider falls back to next connected provider when first is disconnected", () => {
    //#given
    readConnectedProvidersCacheSpy?.mockReturnValue(["nvidia"])

    //#when
    const provider = selectFallbackProvider(["anthropic", "nvidia"])

    //#then
    expect(provider).toBe("nvidia")
  })

  test("selectFallbackProvider uses provider preference order when cache is missing", () => {
    //#given - no cache file

    //#when
    const provider = selectFallbackProvider(["anthropic", "nvidia"], "nvidia")

    //#then
    expect(provider).toBe("anthropic")
  })

  test("selectFallbackProvider uses connected preferred provider when fallback providers are unavailable", () => {
    //#given
    readConnectedProvidersCacheSpy?.mockReturnValue(["provider-x"])

    //#when
    const provider = selectFallbackProvider(["provider-y"], "provider-x")

    //#then
    expect(provider).toBe("provider-x")
  })
})

export {}
