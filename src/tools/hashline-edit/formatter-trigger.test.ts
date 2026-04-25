import { describe, it, expect, beforeEach, mock } from "bun:test"
import {
  runFormattersForFile,
  clearFormatterCache,
  type FormatterClient,
} from "./formatter-trigger"

function createMockClient(config: Record<string, unknown> = {}): FormatterClient {
  return {
    config: {
      get: mock(() => Promise.resolve({ data: config })),
    },
  }
}

describe("runFormattersForFile", () => {
  beforeEach(() => {
    clearFormatterCache()
  })

  it("skips files without extensions", async () => {
    //#given
    const client = createMockClient({
      formatter: {
        prettier: {
          command: ["prettier", "--write", "$FILE"],
          extensions: [".ts"],
        },
      },
    })

    //#when
    await runFormattersForFile(client, "/project", "Makefile")

    //#then
    expect(client.config.get).not.toHaveBeenCalled()
  })

  it("skips when no matching formatters for extension", async () => {
    //#given
    const client = createMockClient({
      formatter: {
        prettier: {
          command: ["prettier", "--write", "$FILE"],
          extensions: [".ts"],
        },
      },
    })

    //#when, run for a .go file, but only .ts formatters registered
    await runFormattersForFile(client, "/project", "/src/main.go")

    //#then, no error thrown
  })

  it("runs formatter for matching extension", async () => {
    //#given
    const client = createMockClient({
      formatter: {
        echo: {
          command: ["echo", "$FILE"],
          extensions: [".ts"],
        },
      },
    })

    //#when, echo is a safe no-op command
    await runFormattersForFile(client, "/tmp", "/tmp/test.ts")

    //#then, should complete without error
    expect(client.config.get).toHaveBeenCalledTimes(1)
  })
})
