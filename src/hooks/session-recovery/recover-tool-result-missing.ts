import type { createOpencodeClient } from "@opencode-ai/sdk"
import type { MessageData } from "./types"
import { readParts, readPartsFromSDK } from "./storage"
import { isSqliteBackend } from "../../shared/opencode-storage-detection"

type Client = ReturnType<typeof createOpencodeClient>
type ClientWithPromptAsync = {
  session: {
    promptAsync: (opts: { path: { id: string }; body: Record<string, unknown> }) => Promise<unknown>
  }
}


interface ToolUsePart {
  type: "tool_use"
  id: string
  name: string
  input: Record<string, unknown>
}

interface MessagePart {
  type: string
  id?: string
}

function isValidToolUseID(id: string | undefined): id is string {
  return typeof id === "string" && /^(toolu_|call_)/.test(id)
}

function normalizeMessagePart(part: { type: string; id?: string; callID?: string }): MessagePart | null {
  if (part.type === "tool" || part.type === "tool_use") {
    if (!isValidToolUseID(part.callID)) {
      return null
    }

    return {
      type: "tool_use",
      id: part.callID,
    }
  }

  return {
    type: part.type,
    id: part.id,
  }
}

function extractToolUseIds(parts: MessagePart[]): string[] {
  return parts.filter((part): part is ToolUsePart => part.type === "tool_use" && isValidToolUseID(part.id)).map((part) => part.id)
}

export async function recoverToolResultMissing(
  client: Client,
  sessionID: string,
  failedAssistantMsg: MessageData
): Promise<boolean> {
  let parts = failedAssistantMsg.parts || []
  if (parts.length === 0 && failedAssistantMsg.info?.id) {
    if (isSqliteBackend()) {
      const sdkParts = await readPartsFromSDK(client, sessionID, failedAssistantMsg.info.id)
      parts = sdkParts.map((part) => normalizeMessagePart(part)).filter((part): part is MessagePart => part !== null)
    } else {
      const storedParts = readParts(failedAssistantMsg.info.id)
      parts = storedParts.map((part) => normalizeMessagePart(part)).filter((part): part is MessagePart => part !== null)
    }
  }

  const toolUseIds = extractToolUseIds(parts)
  if (toolUseIds.length === 0) {
    return false
  }

  const toolResultParts = toolUseIds.map((id) => ({
    type: "tool_result" as const,
    tool_use_id: id,
    content: "Operation cancelled by user (ESC pressed)",
  }))

  const promptInput = {
    path: { id: sessionID },
    body: { parts: toolResultParts },
  }

  try {
    await (client as unknown as ClientWithPromptAsync).session.promptAsync(promptInput)

    return true
  } catch {
    return false
  }
}
