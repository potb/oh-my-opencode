/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import {
  detectRepetitiveToolUse,
  recordToolCall,
  resolveCircuitBreakerSettings,
} from "./loop-detector"

function buildWindow(
  toolNames: string[],
  override?: Parameters<typeof resolveCircuitBreakerSettings>[0]
) {
  const settings = resolveCircuitBreakerSettings(override)

  return toolNames.reduce(
    (window, toolName) => recordToolCall(window, toolName, settings),
    undefined as ReturnType<typeof recordToolCall> | undefined
  )
}

function buildWindowWithInputs(
  calls: Array<{ tool: string; input?: Record<string, unknown> | null }>,
  override?: Parameters<typeof resolveCircuitBreakerSettings>[0]
) {
  const settings = resolveCircuitBreakerSettings(override)
  return calls.reduce(
    (window, { tool, input }) => recordToolCall(window, tool, settings, input),
    undefined as ReturnType<typeof recordToolCall> | undefined
  )
}

describe("loop-detector", () => {
  describe("resolveCircuitBreakerSettings", () => {
    describe("#given nested circuit breaker config", () => {
      test("#when resolved #then nested values override defaults", () => {
        const result = resolveCircuitBreakerSettings({
          maxToolCalls: 200,
          circuitBreaker: {
            maxToolCalls: 120,
            consecutiveThreshold: 7,
          },
        })

        expect(result).toEqual({
          enabled: true,
          maxToolCalls: 120,
          consecutiveThreshold: 7,
        })
      })
    })

    describe("#given no enabled config", () => {
      test("#when resolved #then enabled defaults to true", () => {
        const result = resolveCircuitBreakerSettings({
          circuitBreaker: {
            maxToolCalls: 100,
            consecutiveThreshold: 5,
          },
        })

        expect(result.enabled).toBe(true)
      })
    })

    describe("#given enabled is false in config", () => {
      test("#when resolved #then enabled is false", () => {
        const result = resolveCircuitBreakerSettings({
          circuitBreaker: {
            enabled: false,
            maxToolCalls: 100,
            consecutiveThreshold: 5,
          },
        })

        expect(result.enabled).toBe(false)
      })
    })

    describe("#given enabled is true in config", () => {
      test("#when resolved #then enabled is true", () => {
        const result = resolveCircuitBreakerSettings({
          circuitBreaker: {
            enabled: true,
            maxToolCalls: 100,
            consecutiveThreshold: 5,
          },
        })

        expect(result.enabled).toBe(true)
      })
    })
  })

  describe("detectRepetitiveToolUse", () => {
    describe("#given recent tools are diverse", () => {
      test("#when evaluated #then it does not trigger", () => {
        const window = buildWindow([
          "read",
          "grep",
          "edit",
          "bash",
          "read",
          "glob",
          "lsp_diagnostics",
          "read",
          "grep",
          "edit",
        ])

        const result = detectRepetitiveToolUse(window)

        expect(result.triggered).toBe(false)
      })
    })

    describe("#given the same tool is called consecutively", () => {
      test("#when evaluated #then it triggers", () => {
        const window = buildWindowWithInputs(
          Array.from({ length: 20 }, () => ({
            tool: "read",
            input: { filePath: "/src/same.ts" },
          }))
        )

        const result = detectRepetitiveToolUse(window)

        expect(result).toEqual({
          triggered: true,
          toolName: "read",
          repeatedCount: 20,
        })
      })
    })

    describe("#given consecutive calls are interrupted by different tool", () => {
      test("#when evaluated #then it does not trigger", () => {
        const window = buildWindow([
          ...Array.from({ length: 19 }, () => "read"),
          "edit",
          "read",
        ])

        const result = detectRepetitiveToolUse(window)

        expect(result).toEqual({ triggered: false })
      })
    })

    describe("#given threshold boundary", () => {
      test("#when below threshold #then it does not trigger", () => {
        const belowThresholdWindow = buildWindowWithInputs(
          Array.from({ length: 19 }, () => ({
            tool: "read",
            input: { filePath: "/src/same.ts" },
          }))
        )

        const result = detectRepetitiveToolUse(belowThresholdWindow)

        expect(result).toEqual({ triggered: false })
      })

      test("#when equal to threshold #then it triggers", () => {
        const atThresholdWindow = buildWindowWithInputs(
          Array.from({ length: 20 }, () => ({
            tool: "read",
            input: { filePath: "/src/same.ts" },
          }))
        )

        const result = detectRepetitiveToolUse(atThresholdWindow)

        expect(result).toEqual({
          triggered: true,
          toolName: "read",
          repeatedCount: 20,
        })
      })
    })

    describe("#given same tool with different file inputs", () => {
      test("#when evaluated #then it does not trigger", () => {
        const calls = Array.from({ length: 20 }, (_, i) => ({
          tool: "read",
          input: { filePath: `/src/file-${i}.ts` },
        }))
        const window = buildWindowWithInputs(calls)
        const result = detectRepetitiveToolUse(window)
        expect(result.triggered).toBe(false)
      })
    })

    describe("#given same tool with identical file inputs", () => {
      test("#when evaluated #then it triggers with bare tool name", () => {
        const calls = Array.from({ length: 20 }, () => ({
          tool: "read",
          input: { filePath: "/src/same.ts" },
        }))
        const window = buildWindowWithInputs(calls)
        const result = detectRepetitiveToolUse(window)
        expect(result).toEqual({
          triggered: true,
          toolName: "read",
          repeatedCount: 20,
        })
      })
    })

    describe("#given tool calls with undefined input", () => {
      test("#when evaluated #then it does not trigger", () => {
        const calls = Array.from({ length: 20 }, () => ({ tool: "read" }))
        const window = buildWindowWithInputs(calls)
        const result = detectRepetitiveToolUse(window)
        expect(result).toEqual({ triggered: false })
      })
    })

    describe("#given tool calls with null input", () => {
      test("#when evaluated #then it does not trigger", () => {
        const calls = Array.from({ length: 20 }, () => ({ tool: "read", input: null }))
        const window = buildWindowWithInputs(calls)
        const result = detectRepetitiveToolUse(window)

        expect(result).toEqual({ triggered: false })
      })
    })

    describe("#given nullish tool inputs", () => {
      test("#when recorded #then null and undefined produce the same unknown-input window", () => {
        // given
        const settings = resolveCircuitBreakerSettings()

        // when
        const undefinedWindow = recordToolCall(undefined, "read", settings, undefined)
        const nullWindow = recordToolCall(undefined, "read", settings, null)

        // then
        expect(undefinedWindow).toEqual(nullWindow)
        expect(undefinedWindow).toEqual({
          lastSignature: "read::__unknown-input__",
          consecutiveCount: 1,
          threshold: settings.consecutiveThreshold,
        })
      })
    })
  })
})
