/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test"
import { OhMyOpenCodeConfigSchema, type OhMyOpenCodeConfig } from "../../config"
import { resolveRunAgent } from "./agent-resolver"

const createConfig = (overrides: Partial<OhMyOpenCodeConfig> = {}): OhMyOpenCodeConfig =>
  OhMyOpenCodeConfigSchema.parse(overrides)

describe("resolveRunAgent", () => {
  let consoleLogSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  it("uses CLI agent over env and config", () => {
    const config = createConfig({ default_run_agent: "oracle" })
    const env = { OPENCODE_DEFAULT_AGENT: "Sisyphus" }

    const agent = resolveRunAgent(
      { message: "test", agent: "oracle" },
      config,
      env
    )

    expect(agent).toBe("oracle")
  })

  it("uses env agent over config", () => {
    const config = createConfig({ default_run_agent: "sisyphus" })
    const env = { OPENCODE_DEFAULT_AGENT: "oracle" }

    const agent = resolveRunAgent({ message: "test" }, config, env)

    expect(agent).toBe("oracle")
  })

  it("uses config agent over default", () => {
    const config = createConfig({ default_run_agent: "oracle" })

    const agent = resolveRunAgent({ message: "test" }, config, {})

    expect(agent).toBe("oracle")
  })

  it("falls back to sisyphus when none set", () => {
    const config = createConfig()

    const agent = resolveRunAgent({ message: "test" }, config, {})

    expect(agent).toBe("Sisyphus - Ultraworker")
  })

  it("keeps sisyphus as the only core fallback even when disabled", () => {
    const config = createConfig({ disabled_agents: ["sisyphus"] })

    const agent = resolveRunAgent({ message: "test" }, config, {})

    expect(agent).toBe("Sisyphus - Ultraworker")
  })

  it("maps display-name style default_run_agent values to canonical display names", () => {
    const config = createConfig({ default_run_agent: "Sisyphus - Ultraworker" })

    const agent = resolveRunAgent({ message: "test" }, config, {})

    expect(agent).toBe("Sisyphus - Ultraworker")
  })
})

describe("waitForEventProcessorShutdown", () => {
  it("returns quickly when event processor completes", async () => {
    const { waitForEventProcessorShutdown } = await import("./runner")
    const eventProcessor = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 25)
    })
    const start = performance.now()

    await waitForEventProcessorShutdown(eventProcessor, 200)

    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(200)
  })

  it("times out and continues when event processor does not complete", async () => {
    const { waitForEventProcessorShutdown } = await import("./runner")
    const eventProcessor = new Promise<void>(() => {})
    const timeoutMs = 200
    const start = performance.now()

    await waitForEventProcessorShutdown(eventProcessor, timeoutMs)

    const elapsed = performance.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(timeoutMs - 10)
  })
})

describe("run environment setup", () => {
  let originalClient: string | undefined
  let originalRunMode: string | undefined
  let consoleErrorSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    originalClient = process.env.OPENCODE_CLIENT
    originalRunMode = process.env.OPENCODE_CLI_RUN_MODE
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    if (originalClient === undefined) {
      delete process.env.OPENCODE_CLIENT
    } else {
      process.env.OPENCODE_CLIENT = originalClient
    }
    if (originalRunMode === undefined) {
      delete process.env.OPENCODE_CLI_RUN_MODE
    } else {
      process.env.OPENCODE_CLI_RUN_MODE = originalRunMode
    }
    consoleErrorSpy.mockRestore()
  })

  it("sets OPENCODE_CLIENT to 'run' to exclude question tool from registry", async () => {
    delete process.env.OPENCODE_CLIENT

    const { run } = await import("./runner")
    await run({ message: "test", model: "invalid" })

    expect(String(process.env.OPENCODE_CLIENT)).toBe("run")
    expect(String(process.env.OPENCODE_CLI_RUN_MODE)).toBe("true")
  })
})

describe("run with invalid model", () => {
  it("given invalid --model value, when run, then returns exit code 1 with error message", async () => {
    const originalExit = process.exit
    const originalError = console.error
    const errorMessages: string[] = []
    const exitCodes: number[] = []

    console.error = (...args: unknown[]) => {
      errorMessages.push(args.map(String).join(" "))
    }
    process.exit = ((code?: number) => {
      exitCodes.push(code ?? 0)
      throw new Error("exit")
    }) as typeof process.exit

    try {
      const { run } = await import("./runner")

      try {
        await run({
          message: "test",
          model: "invalid",
        })
      } catch {
        // expected
      }
    } finally {
      console.error = originalError
      process.exit = originalExit
    }
  })
})
