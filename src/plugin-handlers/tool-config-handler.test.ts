import { afterEach, beforeEach, describe, expect, it } from "bun:test"

import type { OhMyOpenCodeConfig } from "../config"
import { applyToolConfig } from "./tool-config-handler"

function createParams(overrides: {
  agents?: string[]
  disabledTools?: string[]
}) {
  const agentResult: Record<string, { permission?: Record<string, unknown> }> = {}
  for (const agent of overrides.agents ?? []) {
    agentResult[agent] = { permission: {} }
  }

  return {
    config: { tools: {}, permission: {} } as Record<string, unknown>,
    pluginConfig: {
      disabled_tools: overrides.disabledTools,
    } as OhMyOpenCodeConfig,
    agentResult: agentResult as Record<string, unknown>,
  }
}

describe("applyToolConfig", () => {
  let originalConfigContent: string | undefined
  let originalCliRunMode: string | undefined

  beforeEach(() => {
    originalConfigContent = process.env.OPENCODE_CONFIG_CONTENT
    originalCliRunMode = process.env.OPENCODE_CLI_RUN_MODE
  })

  afterEach(() => {
    if (originalConfigContent === undefined) {
      delete process.env.OPENCODE_CONFIG_CONTENT
    } else {
      process.env.OPENCODE_CONFIG_CONTENT = originalConfigContent
    }
    if (originalCliRunMode === undefined) {
      delete process.env.OPENCODE_CLI_RUN_MODE
    } else {
      process.env.OPENCODE_CLI_RUN_MODE = originalCliRunMode
    }
  })

  it("preserves explicit deny permissions while disabling removed public tools globally", () => {
    const params = createParams({})
    params.config.permission = {
      webfetch: "deny",
      external_directory: "deny",
    }

    applyToolConfig(params)

    const permission = params.config.permission as Record<string, unknown>
    const tools = params.config.tools as Record<string, unknown>

    expect(permission.webfetch).toBe("deny")
    expect(permission.external_directory).toBe("deny")
    expect(permission.task).toBe("deny")
    expect(tools.background_cancel).toBe(false)
    expect(tools.background_output).toBe(false)
    expect(tools.call_omo_agent).toBe(false)
    expect(tools.interactive_bash).toBe(false)
    expect(tools.session_info).toBe(false)
    expect(tools.session_list).toBe(false)
    expect(tools.session_read).toBe(false)
    expect(tools.session_search).toBe(false)
    expect(tools.skill).toBe(false)
    expect(tools.skill_mcp).toBe(false)
    expect(tools.todoread).toBe(false)
    expect(tools.todowrite).toBe(false)
  })

  it("grants the surviving task/question permissions only to the surviving core agents", () => {
    const params = createParams({ agents: ["sisyphus", "librarian", "sisyphus-junior"] })

    applyToolConfig(params)

    expect((params.agentResult.sisyphus as { permission: Record<string, unknown> }).permission).toEqual({
      question: "allow",
      task: "allow",
    })
    expect((params.agentResult.librarian as { permission: Record<string, unknown> }).permission).toEqual({
      "grep_app_*": "allow",
    })
    expect((params.agentResult["sisyphus-junior"] as { permission: Record<string, unknown> }).permission).toEqual({
      task: "allow",
    })
  })

  it("respects question denial for sisyphus when disabled by host config or CLI run mode", () => {
    process.env.OPENCODE_CONFIG_CONTENT = JSON.stringify({ permission: { question: "deny" } })
    process.env.OPENCODE_CLI_RUN_MODE = "true"
    const params = createParams({ agents: ["sisyphus"], disabledTools: ["question"] })

    applyToolConfig(params)

    expect(
      (params.agentResult.sisyphus as { permission: Record<string, unknown> }).permission.question,
    ).toBe("deny")
  })
})
