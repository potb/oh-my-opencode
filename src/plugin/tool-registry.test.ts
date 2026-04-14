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

const { createToolRegistry, trimToolsToCap } = await import("./tool-registry")

const toolFactories: NonNullable<Parameters<typeof createToolRegistry>[0]["toolFactories"]> = {
  builtinTools: { bash: fakeTool, read: fakeTool },
  createGrepTools: mock(() => ({ grep: fakeTool })),
  createGlobTools: mock(() => ({ glob: fakeTool })),
  createAstGrepTools: mock(() => ({ ast_grep_search: fakeTool, ast_grep_replace: fakeTool })),
  createDelegateTask: mock((options: { onSyncSessionCreated?: typeof syncSessionCreatedCallbacks[number] }) => {
    syncSessionCreatedCallbacks.push(options.onSyncSessionCreated)
    return delegateTaskTool
  }),
  createHashlineEditTool: mock(() => fakeTool),
}

function createPluginConfig(overrides: Partial<OhMyOpenCodeConfig> = {}): OhMyOpenCodeConfig {
  return {
    git_master: {
      commit_footer: false,
      include_co_authored_by: false,
      git_env_prefix: "",
    },
    ...overrides,
  }
}

beforeEach(() => {
  syncSessionCreatedCallbacks.length = 0
})

describe("trimToolsToCap", () => {
  test("removes lower-priority tools like edit before higher-priority core tools", () => {
    const filteredTools = {
      bash: fakeTool,
      edit: fakeTool,
      read: fakeTool,
    } satisfies ToolsRecord

    trimToolsToCap(filteredTools, 2)

    expect(filteredTools).not.toHaveProperty("edit")
    expect(filteredTools).toHaveProperty("bash")
    expect(filteredTools).toHaveProperty("read")
  })
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
    expect(result.filteredTools).toHaveProperty("task")
    expect(result.filteredTools).not.toHaveProperty("background_cancel")
    expect(result.filteredTools).not.toHaveProperty("background_output")
    expect(result.filteredTools).not.toHaveProperty("call_omo_agent")
    expect(result.filteredTools).not.toHaveProperty("interactive_bash")
    expect(result.filteredTools).not.toHaveProperty("look_at")
    expect(result.filteredTools).not.toHaveProperty("session_list")
    expect(result.filteredTools).not.toHaveProperty("skill")
    expect(result.filteredTools).not.toHaveProperty("skill_mcp")
    expect(result.filteredTools).not.toHaveProperty("task_create")
  })

  test("adds hashline edit only when the feature flag is enabled", () => {
    const withoutEdit = createToolRegistry({
      ctx: { directory: "/tmp" } as Parameters<typeof createToolRegistry>[0]["ctx"],
      pluginConfig: createPluginConfig({ hashline_edit: false }),
      managers: {
        backgroundManager: {},
      } as Parameters<typeof createToolRegistry>[0]["managers"],
      toolFactories,
    })
    const withEdit = createToolRegistry({
      ctx: { directory: "/tmp" } as Parameters<typeof createToolRegistry>[0]["ctx"],
      pluginConfig: createPluginConfig({ hashline_edit: true }),
      managers: {
        backgroundManager: {},
      } as Parameters<typeof createToolRegistry>[0]["managers"],
      toolFactories,
    })

    expect(withoutEdit.filteredTools).not.toHaveProperty("edit")
    expect(withEdit.filteredTools).toHaveProperty("edit")
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
