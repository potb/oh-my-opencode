/// <reference types="bun-types" />

import { describe, expect, it } from "bun:test"
import type { PluginInput } from "@opencode-ai/plugin"

import type { OhMyOpenCodeConfig } from "./config"
import { createManagers } from "./create-managers"
import { createModelCacheState } from "./plugin-state"

class MockBackgroundManager {
  constructor(..._args: unknown[]) {}
}

function createRuntimeConfigHook(): ReturnType<typeof import("./plugin/runtime-config-hook").createRuntimeConfigHook> {
  return async () => {}
}

function registerManagerForCleanup(): void {}

function createDeps(): NonNullable<Parameters<typeof createManagers>[0]["deps"]> {
    return {
      BackgroundManagerClass: MockBackgroundManager as typeof import("./features/background-agent").BackgroundManager,
      registerManagerForCleanupFn: registerManagerForCleanup,
      createRuntimeConfigHookFn: createRuntimeConfigHook,
    }
}

function createContext(directory: string): PluginInput {
  const shell = Object.assign(
    () => {
      throw new Error("shell should not be called in this test")
    },
    {
      braces: () => [],
      escape: (input: string) => input,
      env() {
        return shell
      },
      cwd() {
        return shell
      },
      nothrow() {
        return shell
      },
      throws() {
        return shell
      },
    },
  )

  return {
    project: {
      id: "project-id",
      worktree: directory,
      time: { created: Date.now() },
    },
    directory,
    worktree: directory,
    serverUrl: new URL("http://localhost:4096"),
    $: shell,
    client: {} as PluginInput["client"],
  }
}

describe("createManagers", () => {
  it("returns only the live background manager and config handler", () => {
    const managers = createManagers({
      ctx: createContext("/tmp"),
      pluginConfig: {
        disabled_agents: [],
        disabled_hooks: [],
        disabled_tools: [],
        agents: {},
        categories: {},
        experimental: {},
        background_task: {
          defaultConcurrency: 1,
          maxDepth: 1,
          maxDescendants: 1,
          staleTimeoutMs: 1,
          messageStalenessTimeoutMs: 1,
          taskTtlMs: 1,
          sessionGoneTimeoutMs: 1,
          syncPollTimeoutMs: 1,
          maxToolCalls: 1,
          circuitBreaker: { enabled: false, consecutiveThreshold: 1 },
        },
        git_master: { commit_footer: true, include_co_authored_by: true, git_env_prefix: "GIT_MASTER=1" },
        browser_automation_engine: { provider: "agent-browser" },
      } satisfies OhMyOpenCodeConfig,
      modelCacheState: createModelCacheState(),
      deps: createDeps(),
    })

    expect(managers.backgroundManager).toBeInstanceOf(MockBackgroundManager)
    expect(typeof managers.configHook).toBe("function")
    expect("tmuxSessionManager" in managers).toBe(false)
  })
})
