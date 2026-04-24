import type { createOpencodeClient } from "@opencode-ai/sdk"
import { extractUnavailableToolName } from "./detect-error-type"
import { readParts, readPartsFromSDK } from "./storage"
import type { MessageData } from "./types"
import { isSqliteBackend } from "../../shared/opencode-storage-detection"

type Client = ReturnType<typeof createOpencodeClient>

interface ToolResultPart {
  type: "tool_result"
  tool_use_id: string
  content: string
}

interface PromptWithToolResultInput {
  path: { id: string }
  body: { parts: ToolResultPart[] }
}

interface ToolUsePart {
  type: "tool_use"
  id: string
  name: string
}

interface MessagePart {
  type: string
  id?: string
  name?: string
}

function extractToolUseParts(parts: MessagePart[]): ToolUsePart[] {
  return parts.filter(
    (part): part is ToolUsePart =>
      part.type === "tool_use" && typeof part.id === "string" && typeof part.name === "string"
  )
}

export async function recoverUnavailableTool(
  client: Client,
  sessionID: string,
  failedAssistantMsg: MessageData
): Promise<boolean> {
  let parts = failedAssistantMsg.parts || []
  if (parts.length === 0 && failedAssistantMsg.info?.id) {
    if (isSqliteBackend()) {
      const sdkParts = await readPartsFromSDK(client, sessionID, failedAssistantMsg.info.id)
      parts = sdkParts.map((part) => ({
        type: part.type === "tool" ? "tool_use" : part.type,
        id: "callID" in part ? (part as { callID?: string }).callID : part.id,
        name: "tool" in part && typeof part.tool === "string" ? part.tool : undefined,
      }))
    } else {
      const storedParts = readParts(failedAssistantMsg.info.id)
      parts = storedParts.map((part) => ({
        type: part.type === "tool" ? "tool_use" : part.type,
        id: "callID" in part ? (part as { callID?: string }).callID : part.id,
        name: "tool" in part && typeof part.tool === "string" ? part.tool : undefined,
      }))
    }
  }

  const toolUseParts = extractToolUseParts(parts)
  if (toolUseParts.length === 0) {
    return false
  }

  const unavailableToolName = extractUnavailableToolName(failedAssistantMsg.info?.error)
  const matchingToolUses = unavailableToolName
    ? toolUseParts.filter((part) => part.name.toLowerCase() === unavailableToolName)
    : []
  const targetToolUses = matchingToolUses.length > 0 ? matchingToolUses : toolUseParts

  const toolResultParts = targetToolUses.map((part) => ({
    type: "tool_result" as const,
    tool_use_id: part.id,
    content: '{"status":"error","error":"Tool not available. Please continue without this tool."}',
  }))

  try {
    const promptInput: PromptWithToolResultInput = {
      path: { id: sessionID },
      body: { parts: toolResultParts },
    }
    const promptAsync = client.session.promptAsync as (...args: never[]) => unknown
    await Reflect.apply(promptAsync, client.session, [promptInput])
    return true
  } catch {
    return false
  }
}
