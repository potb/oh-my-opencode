import { describe, expect, it } from "bun:test"
import type { OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"
import { createSessionHooks } from "./create-session-hooks"

const mockContext = {
  directory: "/tmp",
  client: {
    tui: {
      showToast: async () => ({}),
    },
    session: {
      get: async () => ({ data: null }),
      update: async () => ({}),
    },
  },
} as unknown as PluginContext

const mockModelCacheState = {} as ModelCacheState

describe("createSessionHooks", () => {
  it("creates session hooks without the removed model fallback surface", () => {
    const pluginConfig = {} as OhMyOpenCodeConfig

    const result = createSessionHooks({
      ctx: mockContext,
      pluginConfig,
      modelCacheState: mockModelCacheState,
      isHookEnabled: () => true,
      safeHookEnabled: true,
    })

    expect(result.thinkMode).not.toBeNull()
    expect(result.autoUpdateChecker).not.toBeNull()
  })

  it("returns null for all session hooks when every hook is disabled", () => {
    const pluginConfig = {} as OhMyOpenCodeConfig

    const result = createSessionHooks({
      ctx: mockContext,
      pluginConfig,
      modelCacheState: mockModelCacheState,
      isHookEnabled: () => false,
      safeHookEnabled: true,
    })

    for (const value of Object.values(result)) {
      expect(value).toBeNull()
    }
  })
})
