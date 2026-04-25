import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { isSqliteBackend } from "./opencode-storage-detection"
import { hasCompactionPartInStorage, isCompactionMessage } from "./compaction-marker"
import { normalizeSDKResponse } from "./normalize-sdk-response"

type ToolPermission = boolean | "allow" | "deny" | "ask"

export interface StoredMessage {
  agent?: string
  model?: { providerID?: string; modelID?: string; variant?: string }
  tools?: Record<string, ToolPermission>
}

type OpencodeClient = PluginInput["client"]

interface SDKMessage {
  id?: string
  info?: {
    agent?: string
    model?: { providerID?: string; modelID?: string; variant?: string }
    tools?: Record<string, ToolPermission>
    time?: { created?: number }
  }
}

function readStoredMessagesFromDirectory(messageDir: string): Array<{
  fileName: string
  message: StoredMessage & { id?: string; time?: { created?: number } }
}> {
  return readdirSync(messageDir)
    .filter(fileName => fileName.endsWith(".json"))
    .map((fileName) => {
      const content = readFileSync(join(messageDir, fileName), "utf-8")
      return {
        fileName,
        message: JSON.parse(content) as StoredMessage & { id?: string; time?: { created?: number } },
      }
    })
}

function convertSDKMessageToStoredMessage(message: SDKMessage): StoredMessage | null {
  if (isCompactionMessage(message)) return null
  const info = message.info
  if (!info) return null
  const providerID = info.model?.providerID
  const modelID = info.model?.modelID
  if (!info.agent && !providerID && !modelID) return null
  return {
    agent: info.agent,
    model: providerID && modelID
      ? { providerID, modelID, ...(info.model?.variant ? { variant: info.model.variant } : {}) }
      : undefined,
    tools: info.tools,
  }
}

export async function findNearestMessageWithFieldsFromSDK(
  client: OpencodeClient,
  sessionID: string,
): Promise<StoredMessage | null> {
  const response = await client.session.messages({ path: { id: sessionID } })
  const messages = normalizeSDKResponse<SDKMessage[]>(response)
    .map((message) => ({
      stored: convertSDKMessageToStoredMessage(message),
      createdAt: message.info?.time?.created ?? Number.NEGATIVE_INFINITY,
      id: typeof message.id === "string" ? message.id : "",
    }))
    .sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))

  for (const { stored } of messages) {
    if (stored?.agent && stored.model?.providerID && stored.model?.modelID) return stored
  }
  for (const { stored } of messages) {
    if (stored?.agent || (stored?.model?.providerID && stored?.model?.modelID)) return stored
  }
  return null
}

function findFirstMessageWithAgentFromStorage(messageDir: string): string | null {
  const messages = readStoredMessagesFromDirectory(messageDir)
    .map(({ fileName, message }) => ({
      fileName,
      message,
      hasCompactionMarker: hasCompactionPartInStorage(message.id),
      createdAt: typeof message.time?.created === "number" ? message.time.created : Number.POSITIVE_INFINITY,
    }))
    .sort((left, right) => left.createdAt - right.createdAt || left.fileName.localeCompare(right.fileName))

  for (const entry of messages) {
    if (entry.hasCompactionMarker || isCompactionMessage({ agent: entry.message.agent })) continue
    if (entry.message.agent) return entry.message.agent
  }
  return null
}

export function findNearestMessageWithFields(messageDir: string): StoredMessage | null {
  if (isSqliteBackend()) return null
  const messages = readStoredMessagesFromDirectory(messageDir)
    .map(({ fileName, message }) => ({
      fileName,
      message,
      hasCompactionMarker: hasCompactionPartInStorage(message.id),
      createdAt: typeof message.time?.created === "number" ? message.time.created : Number.NEGATIVE_INFINITY,
    }))
    .sort((left, right) => right.createdAt - left.createdAt || right.fileName.localeCompare(left.fileName))

  for (const entry of messages) {
    if (entry.hasCompactionMarker || isCompactionMessage({ agent: entry.message.agent })) continue
    if (entry.message.agent && entry.message.model?.providerID && entry.message.model?.modelID) return entry.message
  }
  for (const entry of messages) {
    if (entry.hasCompactionMarker || isCompactionMessage({ agent: entry.message.agent })) continue
    if (entry.message.agent || (entry.message.model?.providerID && entry.message.model?.modelID)) return entry.message
  }
  return null
}

async function findFirstMessageWithAgentFromSDK(client: OpencodeClient, sessionID: string): Promise<string | null> {
  const response = await client.session.messages({ path: { id: sessionID } })
  const messages = normalizeSDKResponse<SDKMessage[]>(response)
    .sort((left, right) => {
      const leftTime = left.info?.time?.created ?? Number.POSITIVE_INFINITY
      const rightTime = right.info?.time?.created ?? Number.POSITIVE_INFINITY
      if (leftTime !== rightTime) return leftTime - rightTime
      return (typeof left.id === "string" ? left.id : "").localeCompare(typeof right.id === "string" ? right.id : "")
    })

  for (const message of messages) {
    const stored = convertSDKMessageToStoredMessage(message)
    if (stored?.agent) return stored.agent
  }
  return null
}
