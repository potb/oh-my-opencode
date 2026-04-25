import type { DelegateTaskArgs, ToolContextWithMetadata } from "./types"
import type { ExecutorContext, SessionMessage } from "./executor-types"
import { isPlanFamily } from "./constants"
import { getAgentToolRestrictions } from "../../shared/agent-tool-restrictions"
import { promptAsyncWithTimeout } from "../../shared/prompt-async-timeout"
import { formatDuration } from "./time-formatter"
import { syncContinuationDeps, type SyncContinuationDeps } from "./sync-continuation-deps"
import { setSessionTools } from "../../shared/session-tools-store"
import { normalizeSDKResponse } from "../../shared"
import { buildTaskPrompt } from "./prompt-builder"

export async function executeSyncContinuation(
  args: DelegateTaskArgs,
  ctx: ToolContextWithMetadata,
  executorCtx: ExecutorContext,
  deps: SyncContinuationDeps = syncContinuationDeps
): Promise<string> {
  const { client, syncPollTimeoutMs, sisyphusAgentConfig } = executorCtx
  const taskId = `resume_sync_${args.session_id!.slice(0, 8)}`
  const startTime = new Date()

  let syncContMeta: { title: string; metadata: Record<string, unknown> } | undefined

  let resumeAgent: string | undefined
  let resumeModel: { providerID: string; modelID: string } | undefined
  let resumeVariant: string | undefined
  let anchorMessageCount: number | undefined

  try {
    try {
      const messagesResp = await client.session.messages({ path: { id: args.session_id! } })
      const messages = normalizeSDKResponse<SessionMessage[]>(messagesResp)
      anchorMessageCount = messages.length
      for (let i = messages.length - 1; i >= 0; i--) {
        const info = messages[i].info
        if (info?.agent || info?.model) {
          resumeAgent = info.agent
          resumeModel = info.model
          resumeVariant = info.variant
          break
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Failed to load continuation context: ${errorMessage}\n\nSession ID: ${args.session_id}`
    }

    syncContMeta = {
      title: `Continue: ${args.description}`,
      metadata: {
        prompt: args.prompt,
        description: args.description,
        run_in_background: args.run_in_background,
        sessionId: args.session_id,
        sync: true,
        command: args.command,
        model: resumeModel,
      },
    }
    await ctx.metadata?.(syncContMeta)

    const allowTask = isPlanFamily(resumeAgent)
    const tddEnabled = sisyphusAgentConfig?.tdd
    const effectivePrompt = buildTaskPrompt(args.prompt, resumeAgent, tddEnabled)
    const tools = {
      task: allowTask,
      question: false,
      ...(resumeAgent ? getAgentToolRestrictions(resumeAgent) : {}),
    }
    setSessionTools(args.session_id!, tools)

    await promptAsyncWithTimeout(client, {
      path: { id: args.session_id! },
      body: {
        ...(resumeAgent !== undefined ? { agent: resumeAgent } : {}),
        ...(resumeModel !== undefined ? { model: resumeModel } : {}),
        ...(resumeVariant !== undefined ? { variant: resumeVariant } : {}),
        tools,
        parts: [{ type: "text", text: effectivePrompt }],
      },
    })
   } catch (promptError) {
      const errorMessage = promptError instanceof Error ? promptError.message : String(promptError)
      return `Failed to send continuation prompt: ${errorMessage}\n\nSession ID: ${args.session_id}`
   }

    const pollError = await deps.pollSyncSession(ctx, client, {
      sessionID: args.session_id!,
      agentToUse: resumeAgent ?? "continue",
      taskId,
      anchorMessageCount,
    }, syncPollTimeoutMs)
    if (pollError) {
      return pollError
    }

    const result = await deps.fetchSyncResult(client, args.session_id!, anchorMessageCount)
    if (!result.ok) {
      return result.error
    }

    const duration = formatDuration(startTime)

    return `Task continued and completed in ${duration}.

---

${result.textContent || "(No text output)"}

<task_metadata>
session_id: ${args.session_id}
${resumeAgent ? `subagent: ${resumeAgent}\n` : ""}</task_metadata>`
}
