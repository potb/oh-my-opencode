import type { DelegateTaskArgs, ToolContextWithMetadata, DelegatedModelConfig } from "./types"
import type { ExecutorContext, ParentContext } from "./executor-types"
import { log } from "../../shared/logger"
import { addSubagentSession, removeSubagentSession } from "../../shared/subagent-session-registry"
import { SessionCategoryRegistry } from "../../shared/session-category-registry"
import { formatDuration } from "./time-formatter"
import { formatDetailedError } from "./error-formatting"
import { syncTaskDeps, type SyncTaskDeps } from "./sync-task-deps"

type ModelFallbackInfo = {
  model: string
  type: "user-defined" | "inherited" | "category-default"
  source?: "override" | "category-default"
}

export async function executeSyncTask(
  args: DelegateTaskArgs,
  ctx: ToolContextWithMetadata,
  executorCtx: ExecutorContext,
  parentContext: ParentContext,
  agentToUse: string,
  categoryModel: DelegatedModelConfig | undefined,
  systemContent: string | undefined,
  modelInfo?: ModelFallbackInfo,
  deps: SyncTaskDeps = syncTaskDeps
): Promise<string> {
  const { manager, client, directory, onSyncSessionCreated, syncPollTimeoutMs } = executorCtx
  let taskId: string | undefined
  let syncSessionID: string | undefined
  let spawnReservation:
    | Awaited<ReturnType<ExecutorContext["manager"]["reserveSubagentSpawn"]>>
    | undefined

  try {
    spawnReservation = await manager.reserveSubagentSpawn(parentContext.sessionID)
    const spawnContext = spawnReservation.spawnContext

    const createSessionResult = await deps.createSyncSession(client, {
      parentSessionID: parentContext.sessionID,
      agentToUse,
      description: args.description,
      defaultDirectory: directory,
    })

    if (!createSessionResult.ok) {
      spawnReservation?.rollback()
      return createSessionResult.error
    }

    const sessionID = createSessionResult.sessionID
    spawnReservation?.commit()
    syncSessionID = sessionID
    addSubagentSession(sessionID)

    if (args.category) {
      SessionCategoryRegistry.register(sessionID, args.category)
    }

    if (onSyncSessionCreated) {
      log("[task] Invoking onSyncSessionCreated callback", { sessionID, parentID: parentContext.sessionID })
      await onSyncSessionCreated({
        sessionID,
        parentID: parentContext.sessionID,
        title: args.description,
      })
      await new Promise(r => setTimeout(r, 200))
    }

    taskId = `sync_${sessionID.slice(0, 8)}`
    const startTime = new Date()

    const syncTaskMeta = {
      title: args.description,
      metadata: {
        prompt: args.prompt,
        agent: agentToUse,
        category: args.category,
        description: args.description,
        run_in_background: args.run_in_background,
        sessionId: sessionID,
        sync: true,
        spawnDepth: spawnContext.childDepth,
        command: args.command,
        model: categoryModel ? { providerID: categoryModel.providerID, modelID: categoryModel.modelID } : undefined,
      },
    }
    await ctx.metadata?.(syncTaskMeta)

    let effectiveCategoryModel = categoryModel
    let promptError = await deps.sendSyncPrompt(client, {
      sessionID,
      agentToUse,
      args,
      systemContent,
      categoryModel: effectiveCategoryModel,
      taskId,
      sisyphusAgentConfig: executorCtx.sisyphusAgentConfig,
    })
    if (promptError) {
      return promptError
    }

    const pollError = await deps.pollSyncSession(ctx, client, {
      sessionID,
      agentToUse,
      taskId,
    }, syncPollTimeoutMs)
    if (pollError) {
      return pollError
    }

    const result = await deps.fetchSyncResult(client, sessionID)
    if (!result.ok) {
      return result.error
    }

    const duration = formatDuration(startTime)

    // 检测模型路由是否与父 session 不同，给用户可见的提示
    const actualModelStr = effectiveCategoryModel
      ? `${effectiveCategoryModel.providerID}/${effectiveCategoryModel.modelID}`
      : undefined
    const parentModelStr = parentContext.model
      ? `${parentContext.model.providerID}/${parentContext.model.modelID}`
      : undefined
    const modelRoutingNote =
      actualModelStr && parentModelStr && actualModelStr !== parentModelStr
        ? `\n⚠️  Model routing: parent used ${parentModelStr}, this subagent used ${actualModelStr} (via category: ${args.category ?? "unknown"})`
        : actualModelStr
          ? `\nModel: ${actualModelStr}${args.category ? ` (category: ${args.category})` : ""}`
          : ""

    return `Task completed in ${duration}.

Agent: ${agentToUse}${args.category ? ` (category: ${args.category})` : ""}${modelRoutingNote}

---

${result.textContent || "(No text output)"}

<task_metadata>
session_id: ${sessionID}
</task_metadata>`
  } catch (error) {
    spawnReservation?.rollback()
    return formatDetailedError(error, {
      operation: "Execute task",
      args,
      sessionID: syncSessionID,
      agent: agentToUse,
      category: args.category,
    })
  } finally {
    if (syncSessionID) {
      removeSubagentSession(syncSessionID)
      SessionCategoryRegistry.remove(syncSessionID)
    }
  }
}
