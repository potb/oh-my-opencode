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

  it("returns original key when casing does not match canonical config key", () => {
    expect(getAgentDisplayName("Sisyphus")).toBe("Sisyphus")
    expect(getAgentDisplayName("METIS")).toBe("METIS")
  })

  it("returns original key for unknown agents", () => {
    expect(getAgentDisplayName("custom-agent")).toBe("custom-agent")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves supported display names to config keys", () => {
    expect(getAgentConfigKey("Sisyphus - Ultraworker")).toBe("sisyphus")
    expect(getAgentConfigKey("Metis - Plan Consultant")).toBe("metis")
    expect(getAgentConfigKey("Momus - Plan Critic")).toBe("momus")
  })

  it("returns lowercased unknown agents", () => {
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
    expect(getAgentConfigKey("Removed Agent - Primary")).toBe("removed agent - primary")
    expect(getAgentConfigKey("Removed Agent (Primary)")).toBe("removed agent (primary)")
  })
})

describe("getAgentListDisplayName", () => {
  it("applies an invisible stable-sort prefix only to sisyphus", () => {
    expect(getAgentListDisplayName("sisyphus")).toBe("\u200BSisyphus - Ultraworker")
  })

  it("keeps non-core agents unprefixed", () => {
    expect(getAgentListDisplayName("oracle")).toBe("oracle")
  })
})
