import type { createOpencodeClient } from "@opencode-ai/sdk"
import {
  createPromptTimeoutContext,
  PROMPT_TIMEOUT_MS,
  type PromptRetryOptions,
} from "./prompt-timeout-context"

type Client = ReturnType<typeof createOpencodeClient>

interface PromptBody {
  model?: { providerID: string; modelID: string }
  [key: string]: unknown
}

interface PromptArgs {
  path: { id: string }
  body: PromptBody
  signal?: AbortSignal
  [key: string]: unknown
}

export async function promptAsyncWithTimeout(
  client: Client,
  args: PromptArgs,
  options: PromptRetryOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? PROMPT_TIMEOUT_MS
  const timeoutContext = createPromptTimeoutContext(args, timeoutMs)
  try {
    await client.session.promptAsync({
      ...args,
      signal: timeoutContext.signal,
    } as Parameters<typeof client.session.promptAsync>[0])
    if (timeoutContext.wasTimedOut()) {
      throw new Error(`promptAsync timed out after ${timeoutMs}ms`)
    }
  } finally {
    timeoutContext.cleanup()
  }
}
