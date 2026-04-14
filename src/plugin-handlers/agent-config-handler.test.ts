/// <reference types="bun-types" />

import type { AgentConfig } from "@opencode-ai/sdk"
import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"

import * as agents from "../agents"
import type { OhMyOpenCodeConfig } from "../config"
import { FIXED_PRODUCT_AGENT_NAMES, REMOVED_AGENT_NAMES } from "../fixed-product"
import { getAgentListDisplayName, getAgentRuntimeName } from "../shared/agent-display-names"
import * as shared from "../shared"
import { applyAgentConfig } from "./agent-config-handler"

function createBaseConfig(): Record<string, unknown> {
  return {
    model: "anthropic/claude-opus-4-6",
    agent: {},
  }
}

function createPluginConfig(overrides: Partial<OhMyOpenCodeConfig> = {}): OhMyOpenCodeConfig {
  return {
    git_master: {
      commit_footer: true,
      include_co_authored_by: true,
      git_env_prefix: "GIT_MASTER=1",
    },
    ...overrides,
  }
}

describe("applyAgentConfig", () => {
  let createBuiltinAgentsSpy: ReturnType<typeof spyOn>
  let logSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    const builtinAgents: Record<string, AgentConfig> = {
      sisyphus: { name: "sisyphus", prompt: "sisyphus prompt", mode: "primary" },
      "sisyphus-junior": {
        name: "sisyphus-junior",
        prompt: "junior prompt",
        mode: "all",
      },
      explore: { name: "explore", prompt: "explore prompt", mode: "subagent" },
      librarian: { name: "librarian", prompt: "librarian prompt", mode: "subagent" },
      metis: { name: "metis", prompt: "metis prompt", mode: "subagent" },
      momus: { name: "momus", prompt: "momus prompt", mode: "subagent" },
      oracle: { name: "oracle", prompt: "oracle prompt", mode: "subagent" },
      atlas: { name: "atlas", prompt: "atlas prompt", mode: "primary" },
    }

    createBuiltinAgentsSpy = spyOn(agents, "createBuiltinAgents").mockResolvedValue(builtinAgents)
    logSpy = spyOn(shared, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    createBuiltinAgentsSpy.mockRestore()
    logSpy.mockRestore()
  })

  test("keeps only the fixed built-in roster and hard-sets the default agent to sisyphus", async () => {
    const config = createBaseConfig()

    const result = await applyAgentConfig({
      config,
      pluginConfig: createPluginConfig(),
      ctx: { directory: "/tmp" },
    })

    expect(config.default_agent).toBe(getAgentRuntimeName("sisyphus"))
    expect(Object.keys(result).sort()).toEqual(
      FIXED_PRODUCT_AGENT_NAMES.map((name) => getAgentListDisplayName(name)).sort(),
    )
    expect(result[getAgentListDisplayName("atlas")]).toBeUndefined()

    for (const key of Object.keys(result)) {
      expect(key).not.toMatch(/[()]/)
    }
  })

  test("calls builtin agent creation with trimmed inputs and removed agents forced disabled", async () => {
    await applyAgentConfig({
      config: createBaseConfig(),
      pluginConfig: createPluginConfig({
        disabled_agents: ["custom-disabled"],
      }),
      ctx: { directory: "/tmp/project" },
    })

    const call = createBuiltinAgentsSpy.mock.calls[0]
    expect(call).toBeDefined()
    expect(call?.[0]).toEqual(expect.arrayContaining(["custom-disabled", ...REMOVED_AGENT_NAMES]))
    expect(call?.[1]).toEqual({})
    expect(call?.[2]).toBe("/tmp/project")
    expect(call?.[4]).toBeUndefined()
    expect(call?.[6]).toEqual([])
    expect(call?.[7]).toEqual([])
    expect(call?.[8]).toBeUndefined()
    expect(call?.[10]).toEqual(new Set())
    expect(call?.[11]).toBe(false)
  })
})
