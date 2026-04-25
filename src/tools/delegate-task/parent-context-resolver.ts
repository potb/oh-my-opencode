import type { ToolContextWithMetadata } from "./types"
import type { OpencodeClient } from "./types"
import type { ParentContext } from "./executor-types"
import { log } from "../../shared/logger"

export async function resolveParentContext(
  ctx: ToolContextWithMetadata,
  client: OpencodeClient
): Promise<ParentContext> {
  void client
  const parentAgent = ctx.agent

  log("[task] parentAgent resolution", {
    sessionID: ctx.sessionID,
    ctxAgent: ctx.agent,
    resolvedParentAgent: parentAgent,
  })

  return {
    sessionID: ctx.sessionID,
    messageID: ctx.messageID,
    agent: parentAgent,
  }
}
