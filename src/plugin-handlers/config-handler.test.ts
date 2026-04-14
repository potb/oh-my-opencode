/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"

import type { AgentConfig } from "@opencode-ai/sdk"

import * as agents from "../agents"
import type { OhMyOpenCodeConfig } from "../config"
import { createModelCacheState } from "../plugin-state"
import { getAgentListDisplayName, getAgentRuntimeName } from "../shared/agent-display-names"
import { createConfigHandler } from "./config-handler"

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

describe("createConfigHandler", () => {
  let createBuiltinAgentsSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    const builtinAgents: Record<string, AgentConfig> = {
      sisyphus: { name: "sisyphus", prompt: "sisyphus prompt", mode: "primary" },
      oracle: { name: "oracle", prompt: "oracle prompt", mode: "subagent" },
      "sisyphus-junior": {
        name: "sisyphus-junior",
        prompt: "junior prompt",
        mode: "all",
      },
    }

    createBuiltinAgentsSpy = spyOn(agents, "createBuiltinAgents").mockResolvedValue(builtinAgents)
  })

  afterEach(() => {
    createBuiltinAgentsSpy.mockRestore()
  })

  test("preserves formatter while clearing removed command and mcp surfaces", async () => {
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-6",
      formatter: { format: true },
      command: { legacy: { description: "legacy" } },
      mcp: { legacy: { type: "remote" } },
    }

    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig: createPluginConfig(),
      modelCacheState: createModelCacheState(),
    })

    await handler(config)

    expect(config.formatter).toEqual({ format: true })
    expect(config.command).toEqual({})
    expect(config.mcp).toEqual({})
  })

  test("hard-sets the default agent to sisyphus and emits the trimmed agent roster", async () => {
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-6",
      default_agent: "oracle",
    }

    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig: createPluginConfig(),
      modelCacheState: createModelCacheState(),
    })

    await handler(config)

    const agentConfig = config.agent as Record<string, unknown>
    expect(config.default_agent).toBe(getAgentRuntimeName("sisyphus"))
    expect(Object.keys(agentConfig)).toEqual([
      getAgentListDisplayName("sisyphus"),
      getAgentListDisplayName("oracle"),
      getAgentListDisplayName("sisyphus-junior"),
    ])
  })

  test("still applies provider cache population while using the simplified config pipeline", async () => {
    const modelCacheState = createModelCacheState()
    const config: Record<string, unknown> = {
      model: "anthropic/claude-opus-4-6",
      provider: {
        anthropic: {
          options: {
            headers: {
              "anthropic-beta": "context-1m-2025-08-07",
            },
          },
          models: {
            "claude-opus-4-6": {
              limit: { context: 1234 },
            },
          },
        },
      },
    }

    const handler = createConfigHandler({
      ctx: { directory: "/tmp", client: {} },
      pluginConfig: createPluginConfig(),
      modelCacheState,
    })

    await handler(config)

    expect(modelCacheState.anthropicContext1MEnabled).toBe(true)
    expect(modelCacheState.modelContextLimitsCache.get("anthropic/claude-opus-4-6")).toBe(1234)
  })
})
