import { describe, it, expect } from "bun:test"
import { normalizeModelFormat } from "./model-format-normalizer"

describe("normalizeModelFormat", () => {
  describe("object format input", () => {
    it("passthroughs object format unchanged", () => {
      const input = { providerID: "opencode", modelID: "glm-5-free" }
      const result = normalizeModelFormat(input)
      expect(result).toEqual(input)
    })
  })

  describe("edge cases", () => {
    it("returns undefined for string input", () => {
      const result = normalizeModelFormat("opencode/glm-5-free" as unknown as { providerID: string; modelID: string })
      expect(result).toBeUndefined()
    })

    it("returns undefined for null", () => {
      const result = normalizeModelFormat(null)
      expect(result).toBeUndefined()
    })

    it("returns undefined for undefined", () => {
      const result = normalizeModelFormat(undefined)
      expect(result).toBeUndefined()
    })
  })
})
