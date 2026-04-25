import { describe, it, expect } from "bun:test"
import {
  getAgentConfigKey,
  getAgentDisplayName,
  getAgentListDisplayName,
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

  it("returns lowercased unknown agents (including removed agents)", () => {
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
    expect(getAgentConfigKey("Removed Agent - Primary")).toBe("removed agent - primary")
    expect(getAgentConfigKey("Removed Agent (Primary)")).toBe("removed agent (primary)")
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
