import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createOpencodeClient } from "@opencode-ai/sdk"

describe("SPIKE: SDK permission field serialization", () => {
  let capturedRequests: Array<{ url: string; body: unknown }> = []
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    capturedRequests = []
    originalFetch = global.fetch

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

      return new Response(
        JSON.stringify({
          data: {
            id: "session-123",
            title: "Test Session",
          },
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
  })

  it("captures HTTP requests made by SDK client", async () => {
    //#given
    const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

    //#when
    const result = await client.session.create({
      body: {
        title: "Test Session",
      },
    })

    //#then
    expect(capturedRequests).toHaveLength(1)
    expect(capturedRequests[0].url).toContain("/session")
    expect(capturedRequests[0].body).toBeDefined()
  })

  it("documents whether permission field appears in request body when cast with as any", async () => {
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
    expect(capturedRequests).toHaveLength(1)
    const requestBody = capturedRequests[0].body as Record<string, unknown>

    console.log("=== SPIKE TEST FINDINGS ===")
    console.log("Request URL:", capturedRequests[0].url)
    console.log("Request body:", JSON.stringify(requestBody, null, 2))
    console.log("Permission field present:", "permission" in (requestBody || {}))
    console.log("Permission value:", requestBody?.permission)
    console.log("===========================")

    if ("permission" in (requestBody || {})) {
      expect(requestBody.permission).toBeDefined()
      console.log("✓ FINDING: permission field IS serialized in request body")
      console.log("✓ FINDING: permission format is object (not array)")
    } else {
      console.log("✗ FINDING: permission field IS NOT serialized in request body")
      console.log("  This explains why the ACP permission delegation fails")
    }
  })
})
