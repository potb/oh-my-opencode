import { describe, it, expect } from "bun:test"
import {
  AGENT_DISPLAY_NAMES,
  getAgentConfigKey,
  getAgentDisplayName,
  getAgentListDisplayName,
  normalizeAgentForPrompt,
  normalizeAgentForPromptKey,
} from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key", () => {
    expect(getAgentDisplayName("sisyphus")).toBe("Sisyphus - Ultraworker")
  })

  it("returns display name case-insensitively for supported agents", () => {
    expect(getAgentDisplayName("Sisyphus")).toBe("Sisyphus - Ultraworker")
    expect(getAgentDisplayName("METIS")).toBe("Metis - Plan Consultant")
  })

  it("returns original key for unknown or removed agents", () => {
    expect(getAgentDisplayName("custom-agent")).toBe("custom-agent")
    expect(getAgentDisplayName("atlas")).toBe("atlas")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves supported display names to config keys", () => {
    expect(getAgentConfigKey("Sisyphus - Ultraworker")).toBe("sisyphus")
    expect(getAgentConfigKey("Metis - Plan Consultant")).toBe("metis")
    expect(getAgentConfigKey("Momus - Plan Critic")).toBe("momus")
  })

  it("keeps resolving legacy atlas display names for backward compatibility", () => {
    expect(getAgentConfigKey("Atlas - Plan Executor")).toBe("atlas")
    expect(getAgentConfigKey("Atlas (Plan Executor)")).toBe("atlas")
  })

  it("returns lowercased unknown agents", () => {
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
  })
})

describe("getAgentListDisplayName", () => {
  it("applies an invisible stable-sort prefix only to sisyphus", () => {
    expect(getAgentListDisplayName("sisyphus")).toBe("\u200BSisyphus - Ultraworker")
  })

  it("keeps non-core and removed agents unprefixed", () => {
    expect(getAgentListDisplayName("oracle")).toBe("oracle")
    expect(getAgentListDisplayName("atlas")).toBe("atlas")
  })
})

describe("normalizeAgentForPrompt", () => {
  it("strips sisyphus UI ordering prefixes back to canonical display names", () => {
    expect(normalizeAgentForPrompt(getAgentListDisplayName("sisyphus"))).toBe("Sisyphus - Ultraworker")
  })

  it("preserves removed atlas legacy display names", () => {
    expect(normalizeAgentForPrompt("Atlas (Plan Executor)")).toBe("Atlas (Plan Executor)")
    expect(normalizeAgentForPrompt("Atlas - Plan Executor")).toBe("Atlas - Plan Executor")
  })
})

describe("normalizeAgentForPromptKey", () => {
  it("converts built-in display names to config keys", () => {
    expect(normalizeAgentForPromptKey("Sisyphus (Ultraworker)")).toBe("sisyphus")
  })

  it("strips UI ordering prefixes before returning config keys", () => {
    expect(normalizeAgentForPromptKey(getAgentListDisplayName("sisyphus"))).toBe("sisyphus")
  })

  it("preserves custom agents", () => {
    expect(normalizeAgentForPromptKey("MyCustomAgent")).toBe("MyCustomAgent")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected supported agent mappings", () => {
    expect(AGENT_DISPLAY_NAMES).toEqual({
      sisyphus: "Sisyphus - Ultraworker",
      "sisyphus-junior": "Sisyphus-Junior",
      metis: "Metis - Plan Consultant",
      momus: "Momus - Plan Critic",
      athena: "Athena - Council",
      "athena-junior": "Athena-Junior - Council",
      oracle: "oracle",
      librarian: "librarian",
      explore: "explore",
      "council-member": "council-member",
    })
  })
})
