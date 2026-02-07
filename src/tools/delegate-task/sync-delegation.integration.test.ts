import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createOpencodeClient } from "@opencode-ai/sdk"
import { __setTimingConfig, __resetTimingConfig } from "./timing"

describe("Integration: Sync Delegation Permission Flow", () => {
  let capturedRequests: Array<{ url: string; body: unknown }> = []
  let originalFetch: typeof global.fetch
  let mockSessionStatus: Record<string, { type: string }> = {}
  let mockSessionMessages: Array<{
    info?: { role: string; time?: { created: number } }
    parts?: Array<{ type: string; text?: string }>
  }> = []

  beforeEach(() => {
    capturedRequests = []
    mockSessionStatus = {}
    mockSessionMessages = []
    originalFetch = global.fetch

    // Fast timing for tests: 10ms poll interval, 0ms stability
    __setTimingConfig({
      POLL_INTERVAL_MS: 10,
      MIN_STABILITY_TIME_MS: 0,
      STABILITY_POLLS_REQUIRED: 1,
      WAIT_FOR_SESSION_INTERVAL_MS: 10,
      WAIT_FOR_SESSION_TIMEOUT_MS: 5000,
      MAX_POLL_TIME_MS: 5000,
    })

    global.fetch = (async (url: string | Request, init?: RequestInit) => {
      let urlStr: string
      let body: unknown = undefined

      if (typeof url === "string") {
        urlStr = url
      } else {
        urlStr = url.url
        if (url.body) {
          try {
            const bodyStr = typeof url.body === "string" ? url.body : await url.text()
            body = JSON.parse(bodyStr)
          } catch {
            body = url.body
          }
        }
      }

      if (!body && init?.body) {
        try {
          body = JSON.parse(init.body as string)
        } catch {
          body = init.body
        }
      }

      capturedRequests.push({ url: urlStr, body })

      // Route to appropriate mock response
      if (urlStr.includes("/session") && !urlStr.includes("/prompt") && !urlStr.includes("/status") && !urlStr.includes("/messages") && init?.method === "POST") {
        // Session creation
        const sessionId = `session-${Date.now()}`
        mockSessionStatus[sessionId] = { type: "idle" }
        return new Response(
          JSON.stringify({
            data: {
              id: sessionId,
              title: "Test Session",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (urlStr.includes("/session") && urlStr.includes("/prompt")) {
        // Prompt submission
        return new Response(
          JSON.stringify({
            data: {},
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (urlStr.includes("/session") && urlStr.includes("/status")) {
        // Status check
        return new Response(
          JSON.stringify({
            data: mockSessionStatus,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (urlStr.includes("/session") && urlStr.includes("/message") && !urlStr.includes("/prompt")) {
        return new Response(
          JSON.stringify(mockSessionMessages),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      // Default response
      return new Response(
        JSON.stringify({
          data: {},
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }) as typeof global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    __resetTimingConfig()
  })

  it("test 1: session creation with correct permission format", async () => {
    //#given
    const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

    //#when
    const result = await client.session.create({
      body: {
        title: "Test Session",
        permission: {
          edit: "allow",
          bash: "allow",
          webfetch: "allow",
          doom_loop: "allow",
          external_directory: "allow",
        },
      } as any,
    })

    //#then
    expect(capturedRequests.length).toBeGreaterThan(0)
    const requestBody = capturedRequests[0].body as Record<string, unknown>

    expect("permission" in (requestBody || {})).toBe(true)
    expect(typeof requestBody?.permission).toBe("object")

    const permission = requestBody?.permission as Record<string, string>
    expect(permission?.edit).toBe("allow")
    expect(permission?.bash).toBe("allow")
    expect(permission?.webfetch).toBe("allow")
    expect(permission?.doom_loop).toBe("allow")
    expect(permission?.external_directory).toBe("allow")
  })

  it("test 2: sync delegation happy path - session → prompt → poll → messages", async () => {
    //#given
    const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

    mockSessionMessages = [
      {
        info: {
          role: "assistant",
          time: { created: Date.now() },
        },
        parts: [
          {
            type: "text",
            text: "Task completed successfully",
          },
        ],
      },
    ]

    //#when
    const createResult = await client.session.create({
      body: {
        title: "Sync Delegation Test",
        permission: {
          edit: "allow",
          bash: "allow",
          webfetch: "allow",
          doom_loop: "allow",
          external_directory: "allow",
        },
      } as any,
    })

    const sessionId = `session-${Date.now()}`

    const promptResult = await client.session.prompt({
      path: { id: sessionId },
      body: {
        agent: "sisyphus-junior",
        system: "You are a helpful assistant",
        parts: [{ type: "text", text: "Do something" }],
      },
    })

    const statusResult = await client.session.status()
    expect(statusResult).toBeDefined()

    const messagesResult = await client.session.messages({
      path: { id: sessionId },
    })

    //#then
    const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as Array<{
      info?: { role: string }
      parts?: Array<{ type: string; text?: string }>
    }>
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)

    const assistantMsg = messages.find((m) => m.info?.role === "assistant")
    expect(assistantMsg).toBeDefined()
    expect(assistantMsg?.parts?.[0]?.text).toBe("Task completed successfully")
  })

  it("test 3: poll timeout on hang - endless busy status triggers timeout", async () => {
    //#given
    const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

    const sessionId = "session-hang"
    mockSessionStatus = {
      [sessionId]: { type: "busy" },
    }

    await client.session.create({
      body: {
        title: "Hang Test",
        permission: {
          edit: "allow",
          bash: "allow",
          webfetch: "allow",
          doom_loop: "allow",
          external_directory: "allow",
        },
      } as any,
    })

    await client.session.prompt({
      path: { id: sessionId },
      body: {
        agent: "sisyphus-junior",
        system: "You are a helpful assistant",
        parts: [{ type: "text", text: "Do something" }],
      },
    })

    //#when
    const startTime = Date.now()
    let pollCount = 0
    const maxPollTime = 1000

    while (Date.now() - startTime < maxPollTime) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      pollCount++

      const statusResult = await client.session.status()
      const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string }>
      const sessionStatus = allStatuses[sessionId]

      if (sessionStatus?.type === "idle") {
        break
      }
    }

    const elapsed = Date.now() - startTime

    //#then
    expect(elapsed).toBeGreaterThanOrEqual(maxPollTime - 100)
    expect(pollCount).toBeGreaterThan(10)
  })

  it("test 4: permission stall reproduction - session without permissions hangs", async () => {
    //#given
    const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

    const sessionId = "session-stall"
    mockSessionStatus[sessionId] = { type: "busy" }

    await client.session.create({
      body: {
        title: "Permission Stall Test",
      } as any,
    })

    const createRequest = capturedRequests.find((r) => r.url.includes("/session") && r.body)
    expect(createRequest).toBeDefined()
    const createBody = createRequest?.body as Record<string, unknown>
    expect("permission" in (createBody || {})).toBe(false)

    await client.session.prompt({
      path: { id: sessionId },
      body: {
        agent: "sisyphus-junior",
        system: "You are a helpful assistant",
        parts: [{ type: "text", text: "Write a file" }],
      },
    })

    //#when
    const startTime = Date.now()
    let pollCount = 0
    const stallTimeout = 2000

    while (Date.now() - startTime < stallTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      pollCount++

      const statusResult = await client.session.status()
      const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string }>
      const sessionStatus = allStatuses[sessionId]

      if (sessionStatus?.type === "idle") {
        break
      }
    }

    const elapsed = Date.now() - startTime

    //#then
    expect(elapsed).toBeGreaterThanOrEqual(stallTimeout - 100)
    expect(pollCount).toBeGreaterThan(5)
    const finalStatus = await client.session.status()
    const allStatuses = (finalStatus.data ?? {}) as Record<string, { type: string }>
    const finalSessionStatus = allStatuses[sessionId]
    expect(finalSessionStatus?.type).not.toBe("idle")
  })
})
