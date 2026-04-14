import { describe, it, expect } from "bun:test"
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper"
import { getAgentDisplayName, getAgentListDisplayName, getAgentRuntimeName } from "../shared/agent-display-names"

describe("remapAgentKeysToDisplayNames", () => {
  it("remaps known agent keys to display names", () => {
    const agents = {
      sisyphus: { prompt: "test", mode: "primary" },
      oracle: { prompt: "test", mode: "subagent" },
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(result[getAgentListDisplayName("sisyphus")]).toBeDefined()
    expect(result["oracle"]).toBeDefined()
    expect(result["sisyphus"]).toBeUndefined()
  })

  it("preserves unknown agent keys unchanged", () => {
    const agents = {
      "custom-agent": { prompt: "custom" },
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(result["custom-agent"]).toBeDefined()
  })

  it("remaps supported display-name agents only", () => {
    const agents = {
      sisyphus: {},
      metis: {},
      momus: {},
      "sisyphus-junior": {},
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(result[getAgentListDisplayName("sisyphus")]).toBeDefined()
    expect(result[getAgentDisplayName("metis")]).toBeDefined()
    expect(result[getAgentDisplayName("momus")]).toBeDefined()
    expect(result[getAgentDisplayName("sisyphus-junior")]).toBeDefined()
  })

  it("does not emit both config and display keys for remapped agents", () => {
    const agents = {
      sisyphus: { prompt: "test", mode: "primary" },
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(Object.keys(result)).toEqual([getAgentListDisplayName("sisyphus")])
    expect(result[getAgentListDisplayName("sisyphus")]).toBeDefined()
    expect(result["sisyphus"]).toBeUndefined()
  })

  it("keeps remapped core agent name fields aligned with OpenCode list ordering", () => {
    const agents = {
      sisyphus: { name: "sisyphus", prompt: "test", mode: "primary" },
      oracle: { name: "oracle", prompt: "test", mode: "subagent" },
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(Object.keys(result).slice(0, 1)).toEqual([getAgentListDisplayName("sisyphus")])
    expect(result[getAgentListDisplayName("sisyphus")]).toEqual({
      name: getAgentRuntimeName("sisyphus"),
      prompt: "test",
      mode: "primary",
    })
    expect(result.oracle).toEqual({ name: "oracle", prompt: "test", mode: "subagent" })
  })

  it("backfills runtime names for core agents when builtin configs omit name", () => {
    const agents = {
      sisyphus: { prompt: "test", mode: "primary" },
    }

    const result = remapAgentKeysToDisplayNames(agents)

    expect(result[getAgentListDisplayName("sisyphus")]).toEqual({
      name: getAgentRuntimeName("sisyphus"),
      prompt: "test",
      mode: "primary",
    })
  })
})
