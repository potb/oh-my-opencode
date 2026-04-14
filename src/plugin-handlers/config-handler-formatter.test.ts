import { afterEach, beforeEach, describe, expect, spyOn, test, mock } from "bun:test"

import type { OhMyOpenCodeConfig } from "../config"
import * as agentConfigHandler from "./agent-config-handler"
import * as providerConfigHandler from "./provider-config-handler"
import * as shared from "../shared"
import * as toolConfigHandler from "./tool-config-handler"

let logSpy: ReturnType<typeof spyOn>
let applyAgentConfigSpy: ReturnType<typeof spyOn>
let applyToolConfigSpy: ReturnType<typeof spyOn>
let applyProviderConfigSpy: ReturnType<typeof spyOn>
let createConfigHandler: (typeof import("./config-handler"))["createConfigHandler"]

async function importFreshConfigHandlerModule(): Promise<typeof import("./config-handler")> {
  return import(`./config-handler?test=${Date.now()}-${Math.random()}`)
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

beforeEach(async () => {
  mock.restore()

  logSpy = spyOn(shared, "log").mockImplementation(() => {})
  applyAgentConfigSpy = spyOn(agentConfigHandler, "applyAgentConfig").mockResolvedValue(
    {},
  )
  applyToolConfigSpy = spyOn(toolConfigHandler, "applyToolConfig").mockImplementation(
    () => {},
  )
  applyProviderConfigSpy = spyOn(
    providerConfigHandler,
    "applyProviderConfig",
  ).mockImplementation(() => {})
  ;({ createConfigHandler } = await importFreshConfigHandlerModule())
})

afterEach(() => {
  logSpy.mockRestore()
  applyAgentConfigSpy.mockRestore()
  applyToolConfigSpy.mockRestore()
  applyProviderConfigSpy.mockRestore()
  mock.restore()
})

describe("createConfigHandler formatter pass-through", () => {
  test("preserves formatter object configured in opencode config", async () => {
    // given
    const pluginConfig = createPluginConfig()
    const formatterConfig = {
      prettier: {
        command: ["prettier", "--write"],
        extensions: [".ts", ".tsx"],
        environment: {
          PRETTIERD_DEFAULT_CONFIG: ".prettierrc",
        },
      },
      eslint: {
        disabled: false,
        command: ["eslint", "--fix"],
        extensions: [".js", ".ts"],
      },
    }
    const config: Record<string, unknown> = {
      formatter: formatterConfig,
    }
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    })

    // when
    await handler(config)

    // then
    expect(config.formatter).toEqual(formatterConfig)
  })

  test("preserves formatter=false configured in opencode config", async () => {
    // given
    const pluginConfig = createPluginConfig()
    const config: Record<string, unknown> = {
      formatter: false,
    }
    const handler = createConfigHandler({
      ctx: { directory: "/tmp" },
      pluginConfig,
      modelCacheState: {
        anthropicContext1MEnabled: false,
        modelContextLimitsCache: new Map(),
      },
    })

    // when
    await handler(config)

    // then
    expect(config.formatter).toBe(false)
  })
})
