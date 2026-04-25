import { beforeEach, describe, expect, mock, test } from "bun:test"
import { tool } from "@opencode-ai/plugin"

import type { OhMyOpenCodeConfig } from "../config"
import type { ToolsRecord } from "./types"

const fakeTool = tool({
  description: "test tool",
  args: {},
  async execute(): Promise<string> {
    return "ok"
  },
})

const delegateTaskTool = tool({
  description: "task tool",
  args: {},
  async execute(): Promise<string> {
    return "ok"
  },
})

const syncSessionCreatedCallbacks: Array<
  ((event: { sessionID: string; parentID: string; title: string }) => Promise<void>) | undefined
> = []

const { createToolRegistry } = await import("./tool-registry")

const toolFactories: NonNullable<Parameters<typeof createToolRegistry>[0]["toolFactories"]> = {
  builtinTools: {
    bash: fakeTool,
    read: fakeTool,
    lsp_goto_definition: fakeTool,
    lsp_find_references: fakeTool,
    lsp_symbols: fakeTool,
    lsp_diagnostics: fakeTool,
    lsp_prepare_rename: fakeTool,
    lsp_rename: fakeTool,
  },
  createGrepTools: mock(() => ({ grep: fakeTool })),
  createGlobTools: mock(() => ({ glob: fakeTool })),
  createAstGrepTools: mock(() => ({ ast_grep_search: fakeTool, ast_grep_replace: fakeTool })),
  createDelegateTask: mock((options: { onSyncSessionCreated?: typeof syncSessionCreatedCallbacks[number] }) => {
    syncSessionCreatedCallbacks.push(options.onSyncSessionCreated)
    return delegateTaskTool
  }),
}

function createPluginConfig(overrides: Partial<OhMyOpenCodeConfig> = {}): OhMyOpenCodeConfig {
  return {
    git_master: {
      commit_footer: false,
      include_co_authored_by: false,
      git_env_prefix: "",
    },
    background_task: {
      defaultConcurrency: 5, maxDepth: 3, maxDescendants: 50,
      staleTimeoutMs: 2_700_000, messageStalenessTimeoutMs: 3_600_000,
      taskTtlMs: 1_800_000, sessionGoneTimeoutMs: 60_000,
      syncPollTimeoutMs: 600_000, maxToolCalls: 4000,
      circuitBreaker: { enabled: true, consecutiveThreshold: 20 },
    },
    experimental: { truncate_all_tool_outputs: false, disable_omo_env: false },
    ...overrides,
  }
}

beforeEach(() => {
  syncSessionCreatedCallbacks.length = 0
})

describe("createToolRegistry", () => {
  test("registers only the trimmed core tool surface", () => {
    const result = createToolRegistry({
      ctx: { directory: "/tmp" } as Parameters<typeof createToolRegistry>[0]["ctx"],
      pluginConfig: createPluginConfig(),
      managers: {
        backgroundManager: {},
      } as Parameters<typeof createToolRegistry>[0]["managers"],
      toolFactories,
    })

    expect(result.taskSystemEnabled).toBe(false)
    expect(result.filteredTools).toHaveProperty("bash")
    expect(result.filteredTools).toHaveProperty("read")
    expect(result.filteredTools).toHaveProperty("grep")
    expect(result.filteredTools).toHaveProperty("glob")
    expect(result.filteredTools).toHaveProperty("ast_grep_search")
    expect(result.filteredTools).toHaveProperty("lsp_goto_definition")
    expect(result.filteredTools).toHaveProperty("lsp_find_references")
    expect(result.filteredTools).toHaveProperty("lsp_symbols")
    expect(result.filteredTools).toHaveProperty("lsp_diagnostics")
    expect(result.filteredTools).toHaveProperty("lsp_prepare_rename")
    expect(result.filteredTools).toHaveProperty("lsp_rename")
    expect(result.filteredTools).toHaveProperty("task")
    expect(result.filteredTools).not.toHaveProperty("background_cancel")
    expect(result.filteredTools).not.toHaveProperty("background_output")
    expect(result.filteredTools).not.toHaveProperty("interactive_bash")
    expect(result.filteredTools).not.toHaveProperty("session_list")
    expect(result.filteredTools).not.toHaveProperty("skill")
    expect(result.filteredTools).not.toHaveProperty("skill_mcp")
    expect(result.filteredTools).not.toHaveProperty("task_create")
  })

  test("does not attach a sync session-created side effect in the fixed product", async () => {
    createToolRegistry({
      ctx: { directory: "/tmp/project" } as Parameters<typeof createToolRegistry>[0]["ctx"],
      pluginConfig: createPluginConfig(),
      managers: {
        backgroundManager: {},
      } as Parameters<typeof createToolRegistry>[0]["managers"],
      toolFactories,
    })

    expect(syncSessionCreatedCallbacks[0]).toBeUndefined()
  })
})
