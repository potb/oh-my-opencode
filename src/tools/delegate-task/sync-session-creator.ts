import type { OpencodeClient } from "./types"
import { QUESTION_DENIED_SESSION_PERMISSION } from "../../shared/question-denied-session-permission"

export async function createSyncSession(
  client: OpencodeClient,
  input: { parentSessionID: string; agentToUse: string; description: string; defaultDirectory: string }
): Promise<{ ok: true; sessionID: string; parentDirectory: string } | { ok: false; error: string }> {
  if (!client.session.get) {
    return { ok: false, error: "Failed to resolve parent session directory: session.get unavailable" }
  }

  let parentSession: Awaited<ReturnType<typeof client.session.get>>
  try {
    parentSession = await client.session.get({ path: { id: input.parentSessionID } })
  } catch (error) {
    return { ok: false, error: `Failed to resolve parent session directory: ${String(error)}` }
  }

  const parentDirectory = parentSession.data?.directory
  if (!parentDirectory) {
    return { ok: false, error: `Failed to resolve parent session directory for ${input.parentSessionID}` }
  }

  const createResult = await client.session.create({
    body: {
      parentID: input.parentSessionID,
      title: `${input.description} (@${input.agentToUse} subagent)`,
      permission: QUESTION_DENIED_SESSION_PERMISSION,
    } as Record<string, unknown>,
    query: {
      directory: parentDirectory,
    },
  })

  if (createResult.error) {
    return { ok: false, error: `Failed to create session: ${createResult.error}` }
  }

  return { ok: true, sessionID: createResult.data.id, parentDirectory }
}
