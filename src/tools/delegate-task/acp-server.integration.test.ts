import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { execSync } from "child_process"
import { createOpencode } from "@opencode-ai/sdk"
import type { Server } from "bun"
import { CHILD_SESSION_PERMISSIONS } from "../../shared/child-session-permissions"

let opencodeBinaryAvailable = false
try {
  execSync("which opencode", { stdio: "pipe" })
  opencodeBinaryAvailable = true
} catch {
  opencodeBinaryAvailable = false
}

const describeIfOpencode = opencodeBinaryAvailable ? describe : describe.skip

describeIfOpencode("Integration: ACP Server Permission Flow (real opencode server)", () => {
  let mockLlmServer: Server
  let mockLlmPort: number
  let mockLlmRequestCount = 0
  let opencodeClient: Awaited<ReturnType<typeof createOpencode>>["client"]
  let opencodeServer: Awaited<ReturnType<typeof createOpencode>>["server"]
  const abortController = new AbortController()

  beforeAll(async () => {
    //#given - mock LLM server (OpenAI-compatible)
    mockLlmServer = Bun.serve({
      port: 0,
      hostname: "127.0.0.1",
      async fetch(req) {
        const url = new URL(req.url)

        if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
          mockLlmRequestCount++

          const body = await req.json().catch(() => ({}))
          const isStreaming = (body as any).stream === true

          if (isStreaming) {
            const chunks = [
              `data: ${JSON.stringify({ id: `chatcmpl-mock-${mockLlmRequestCount}`, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "mock-model", choices: [{ index: 0, delta: { role: "assistant", content: "Hello! I completed the task." }, finish_reason: null }] })}\n\n`,
              `data: ${JSON.stringify({ id: `chatcmpl-mock-${mockLlmRequestCount}`, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "mock-model", choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 } })}\n\n`,
              "data: [DONE]\n\n",
            ]

            return new Response(chunks.join(""), {
              status: 200,
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            })
          }

          return new Response(
            JSON.stringify({
              id: `chatcmpl-mock-${mockLlmRequestCount}`,
              object: "chat.completion",
              created: Math.floor(Date.now() / 1000),
              model: "mock-model",
              choices: [
                {
                  index: 0,
                  message: {
                    role: "assistant",
                    content: "Hello! I completed the task.",
                  },
                  finish_reason: "stop",
                },
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30,
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          )
        }

        if (url.pathname === "/v1/models") {
          return new Response(
            JSON.stringify({
              object: "list",
              data: [
                { id: "mock-model", object: "model", created: 1234567890, owned_by: "mock" },
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          )
        }

        return new Response("Not Found", { status: 404 })
      },
    })
    mockLlmPort = mockLlmServer.port

    //#given - real opencode server with config-level permissions (the ACP fix)
    const serverPort = 10000 + Math.floor(Math.random() * 50000)
    const result = await createOpencode({
      port: serverPort,
      hostname: "127.0.0.1",
      timeout: 15000,
      signal: abortController.signal,
      config: {
        provider: {
          "mock-provider": {
            npm: "@ai-sdk/openai-compatible",
            api: `http://127.0.0.1:${mockLlmPort}/v1`,
            models: {
              "mock-model": {
                name: "Mock Model",
                tool_call: true,
                limit: { context: 128000, output: 4096 },
              },
            },
            options: {
              apiKey: "mock-api-key-12345",
              baseURL: `http://127.0.0.1:${mockLlmPort}/v1`,
            },
          },
        },
        model: "mock-provider/mock-model",
        permission: CHILD_SESSION_PERMISSIONS,
      },
    })
    opencodeClient = result.client
    opencodeServer = result.server
  }, 30000)

  afterAll(() => {
    try {
      opencodeServer?.close()
    } catch {
      /* already closed */
    }
    try {
      mockLlmServer?.stop(true)
    } catch {
      /* already stopped */
    }
    abortController.abort()
  })

  it("test 1: session creation succeeds with config-level CHILD_SESSION_PERMISSIONS", async () => {
    //#given - server configured with CHILD_SESSION_PERMISSIONS at config level

    //#when
    const result = await opencodeClient.session.create({
      body: { title: "ACP Config Permission Test" },
    })

    //#then
    const session = result.data
    expect(session).toBeDefined()
    expect(session?.id).toBeDefined()
    expect(typeof session?.id).toBe("string")
    expect(session?.id.length).toBeGreaterThan(0)

    const getResult = await opencodeClient.session.get({
      path: { id: session!.id },
    })
    expect(getResult.data).toBeDefined()
    expect(getResult.data?.id).toBe(session!.id)
  }, 30000)

  it("test 2: full prompt-poll cycle completes without ACP permission hang", async () => {
    //#given
    mockLlmRequestCount = 0

    const createResult = await opencodeClient.session.create({
      body: { title: "ACP Prompt-Poll Test" },
    })
    const session = createResult.data!
    const sessionId = session.id
    const directory = session.directory

    //#when
    await opencodeClient.session.promptAsync({
      path: { id: sessionId },
      body: {
        parts: [{ type: "text", text: "Say hello" }],
      },
    })

    const maxPollMs = 60000
    const pollIntervalMs = 500
    const startTime = Date.now()
    let finalStatus: string | undefined

    while (Date.now() - startTime < maxPollMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))

      const statusResult = await opencodeClient.session.status({
        query: { directory },
      })
      const allStatuses = statusResult.data ?? {}
      const sessionStatus = allStatuses[sessionId]

      //#then - session is idle when absent from status map OR explicitly idle
      if (!sessionStatus || sessionStatus.type === "idle") {
        finalStatus = "idle"
        break
      }
    }

    expect(finalStatus).toBe("idle")
    expect(mockLlmRequestCount).toBeGreaterThan(0)

    const messagesResult = await opencodeClient.session.messages({
      path: { id: sessionId },
    })
    const messages = messagesResult.data ?? []
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)
  }, 90000)
})
