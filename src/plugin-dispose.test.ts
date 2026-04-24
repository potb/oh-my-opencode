import { describe, expect, spyOn, test } from "bun:test"

import { disposeCreatedHooks } from "./create-hooks"
import { createPluginDispose } from "./plugin-dispose"

describe("createPluginDispose", () => {
  test("calls backgroundManager.shutdown()", async () => {
    const backgroundManager = {
      shutdown: async (): Promise<void> => {},
    }
    const lspManager = {
      stopAll: async (): Promise<void> => {},
    }
    const shutdownSpy = spyOn(backgroundManager, "shutdown")
    const dispose = createPluginDispose({
      backgroundManager,
      lspManager,
      disposeHooks: (): void => {},
    })

    await dispose()

    expect(shutdownSpy).toHaveBeenCalledTimes(1)
  })

  test("calls hook disposers", async () => {
    const commentChecker = { dispose: (): void => {} }
    const lspManager = { stopAll: async (): Promise<void> => {} }

    const commentCheckerDisposeSpy = spyOn(commentChecker, "dispose")

    const dispose = createPluginDispose({
      backgroundManager: {
        shutdown: async (): Promise<void> => {},
      },
      lspManager,
      disposeHooks: (): void => {
        disposeCreatedHooks({
          commentChecker,
        })
      },
    })

    await dispose()

    expect(commentCheckerDisposeSpy).toHaveBeenCalledTimes(1)
  })

  test("is idempotent", async () => {
    const backgroundManager = {
      shutdown: async (): Promise<void> => {},
    }
    const lspManager = {
      stopAll: async (): Promise<void> => {},
    }
    const disposeHooks = { run: (): void => {} }

    const shutdownSpy = spyOn(backgroundManager, "shutdown")
    const stopAllSpy = spyOn(lspManager, "stopAll")
    const disposeHooksSpy = spyOn(disposeHooks, "run")

    const dispose = createPluginDispose({
      backgroundManager,
      lspManager,
      disposeHooks: disposeHooks.run,
    })

    await dispose()
    await dispose()

    expect(shutdownSpy).toHaveBeenCalledTimes(1)
    expect(stopAllSpy).toHaveBeenCalledTimes(1)
    expect(disposeHooksSpy).toHaveBeenCalledTimes(1)
  })

  test("still runs disposeHooks when backgroundManager.shutdown() throws", async () => {
    const backgroundManager = {
      shutdown: async (): Promise<void> => {
        throw new Error("shutdown failed")
      },
    }
    const lspManager = {
      stopAll: async (): Promise<void> => {},
    }
    const disposeHooksCalls: number[] = []

    const dispose = createPluginDispose({
      backgroundManager,
      lspManager,
      disposeHooks: (): void => {
        disposeHooksCalls.push(1)
      },
    })

    await dispose()

    expect(disposeHooksCalls).toHaveLength(1)
  })

  test("still runs disposeHooks when lspManager.stopAll() throws", async () => {
    const backgroundManager = {
      shutdown: async (): Promise<void> => {},
    }
    const lspManager = {
      stopAll: async (): Promise<void> => {
        throw new Error("stopAll failed")
      },
    }
    const disposeHooksCalls: number[] = []
    const shutdownSpy = spyOn(backgroundManager, "shutdown")

    const dispose = createPluginDispose({
      backgroundManager,
      lspManager,
      disposeHooks: (): void => {
        disposeHooksCalls.push(1)
      },
    })

    await dispose()

    expect(shutdownSpy).toHaveBeenCalledTimes(1)
    expect(disposeHooksCalls).toHaveLength(1)
  })

  test("stops the lsp manager", async () => {
    const lspManager = {
      stopAll: async (): Promise<void> => {},
    }
    const stopAllSpy = spyOn(lspManager, "stopAll")
    const dispose = createPluginDispose({
      backgroundManager: {
        shutdown: async (): Promise<void> => {},
      },
      lspManager,
      disposeHooks: (): void => {},
    })

    await dispose()

    expect(stopAllSpy).toHaveBeenCalledTimes(1)
  })
})
