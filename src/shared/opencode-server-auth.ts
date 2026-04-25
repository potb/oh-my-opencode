import { log } from "./logger"

/**
 * Builds HTTP Basic Auth header from environment variables.
 *
 * @returns Basic Auth header string, or undefined if OPENCODE_SERVER_PASSWORD is not set
 */
function getServerBasicAuthHeader(): string | undefined {
  const password = process.env.OPENCODE_SERVER_PASSWORD
  if (!password) {
    return undefined
  }

  const username = process.env.OPENCODE_SERVER_USERNAME ?? "opencode"
  const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64")

  return `Basic ${token}`
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function isRequestFetch(value: unknown): value is (request: Request) => Promise<Response> {
  return typeof value === "function"
}

function wrapRequestFetch(
  baseFetch: (request: Request) => Promise<Response>,
  auth: string
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const headers = new Headers(request.headers)
    headers.set("Authorization", auth)
    return baseFetch(new Request(request, { headers }))
  }
}

function getInternalClient(client: unknown): UnknownRecord | null {
  if (!isRecord(client)) {
    return null
  }

  const internal = client["_client"]
  return isRecord(internal) ? internal : null
}

function injectViaSetConfigHeaders(internal: UnknownRecord, auth: string): void {
  const setConfig = internal["setConfig"]
  if (typeof setConfig !== "function") {
    throw new Error(`OPENCODE_SERVER_PASSWORD is set but SDK client structure is incompatible: ${Object.keys(internal).join(", ")}`)
  }

  setConfig({
    headers: {
      Authorization: auth,
    },
  })
}

/**
 * Injects HTTP Basic Auth header into the OpenCode SDK client.
 *
 * This function accesses the SDK's internal `_client.setConfig()` method.
 * While `_client` has an underscore prefix (suggesting internal use), this is actually
 * a stable public API from `@hey-api/openapi-ts` generated client:
 * - `setConfig()` MERGES headers (does not replace existing ones)
 * - This is the documented way to update client config at runtime
 *
 * @see https://github.com/sst/opencode/blob/main/packages/sdk/js/src/gen/client/client.gen.ts
 * @throws {Error} If OPENCODE_SERVER_PASSWORD is set but client structure is incompatible
 */
export function injectServerAuthIntoClient(client: unknown): void {
  const auth = getServerBasicAuthHeader()
  if (!auth) {
    return
  }

  try {
    const internal = getInternalClient(client)
    if (!internal) {
      throw new Error("OPENCODE_SERVER_PASSWORD is set but no compatible SDK client found")
    }
    injectViaSetConfigHeaders(internal, auth)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log("[opencode-server-auth] Failed to inject server auth", { message })
    throw error instanceof Error ? error : new Error(message)
  }
}
