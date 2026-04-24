import type { OhMyOpenCodeConfig } from "../config";
import type { PluginContext } from "./types";

import {
  clearSessionAgent,
  getMainSessionID,
  setMainSession,
  subagentSessions,
  syncSubagentSessions,
  updateSessionAgent,
} from "../features/claude-code-session-state";
import {
  clearBackgroundOutputConsumptionsForParentSession,
  clearBackgroundOutputConsumptionsForTaskSession,
  restoreBackgroundOutputConsumption,
} from "../shared/background-output-consumption";
import { resetMessageCursor } from "../shared";
import { log } from "../shared/logger";
import { clearSessionModel, setSessionModel } from "../shared/session-model-state";
import { clearSessionPromptParams } from "../shared/session-prompt-params-state";
import { deleteSessionTools } from "../shared/session-tools-store";
import { lspManager } from "../tools";

import type { CreatedHooks } from "../create-hooks";
import type { Managers } from "../create-managers";
import { pruneRecentSyntheticIdles } from "./recent-synthetic-idles";
import { normalizeSessionStatusToIdle } from "./session-status-normalizer";

type FirstMessageVariantGate = {
  markSessionCreated: (sessionInfo: { id?: string; title?: string; parentID?: string } | undefined) => void;
  clear: (sessionID: string) => void;
};

function isCompactionAgent(agent: string): boolean {
  return agent.toLowerCase() === "compaction";
}

type EventInput = Parameters<NonNullable<NonNullable<CreatedHooks["writeExistingFileGuard"]>["event"]>>[0];
export function createEventHandler(args: {
  ctx: PluginContext;
  pluginConfig: OhMyOpenCodeConfig;
  firstMessageVariantGate: FirstMessageVariantGate;
  managers: Managers;
  hooks: CreatedHooks;
}): (input: EventInput) => Promise<void> {
  const { ctx, firstMessageVariantGate, hooks, managers } = args;
  const pluginContext = ctx as {
    directory: string;
    client: {
      session: {
        abort: (input: { path: { id: string } }) => Promise<unknown>;
        promptAsync?: (input: {
          path: { id: string };
          body: { parts: Array<{ type: "text"; text: string }> };
          query: { directory: string };
        }) => Promise<unknown>;
        prompt: (input: {
          path: { id: string };
          body: { parts: Array<{ type: "text"; text: string }> };
          query: { directory: string };
        }) => Promise<unknown>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        summarize: (...args: any[]) => Promise<unknown>;
      };
    };
  };
  const lastKnownModelBySession = new Map<string, { providerID: string; modelID: string }>();

  const getEventSessionID = (input: EventInput): string | undefined => {
    const properties = input.event.properties;
    if (
      !properties ||
      typeof properties !== "object" ||
      !("sessionID" in properties) ||
      typeof properties.sessionID !== "string"
    ) {
      return undefined;
    }
    return properties.sessionID;
  };

  const runEventHookSafely = async (
    hookName: string,
    handler: ((input: EventInput) => unknown | Promise<unknown>) | null | undefined,
    input: EventInput,
  ): Promise<void> => {
    if (!handler) return;

    try {
      await Promise.resolve(handler(input));
    } catch (error) {
      log("[event] hook execution failed", {
        hook: hookName,
        eventType: input.event.type,
        sessionID: getEventSessionID(input),
        error,
      });
    }
  };

  const dispatchToHooks = async (input: EventInput): Promise<void> => {
    try {
      managers.backgroundManager.handleEvent(input.event);
    } catch (error) {
      log("[event] background manager event handling failed", {
        eventType: input.event.type,
        sessionID: getEventSessionID(input),
        error,
      });
    }

    await runEventHookSafely("autoUpdateChecker", hooks.autoUpdateChecker?.event, input);
    await runEventHookSafely("legacyPluginToast", hooks.legacyPluginToast?.event, input);
    await runEventHookSafely("contextWindowMonitor", hooks.contextWindowMonitor?.event, input);
    await runEventHookSafely("preemptiveCompaction", hooks.preemptiveCompaction?.event, input);
    await runEventHookSafely("thinkMode", hooks.thinkMode?.event, input);
    await runEventHookSafely(
      "anthropicContextWindowLimitRecovery",
      hooks.anthropicContextWindowLimitRecovery?.event,
      input,
    );
    await runEventHookSafely("compactionContextInjector", hooks.compactionContextInjector?.event, input);
    await runEventHookSafely("compactionTodoPreserver", hooks.compactionTodoPreserver?.event, input);
    await runEventHookSafely("writeExistingFileGuard", hooks.writeExistingFileGuard?.event, input);
  };

  const recentSyntheticIdles = new Map<string, number>();
  const recentRealIdles = new Map<string, number>();
  const DEDUP_WINDOW_MS = 500;

  return async (input): Promise<void> => {
    pruneRecentSyntheticIdles({
      recentSyntheticIdles,
      recentRealIdles,
      now: Date.now(),
      dedupWindowMs: DEDUP_WINDOW_MS,
    });

    if (input.event.type === "session.idle") {
      const sessionID = (input.event.properties as Record<string, unknown> | undefined)?.sessionID as
        | string
        | undefined;
      if (sessionID) {
        const emittedAt = recentSyntheticIdles.get(sessionID);
        if (emittedAt && Date.now() - emittedAt < DEDUP_WINDOW_MS) {
          recentSyntheticIdles.delete(sessionID);
        }
        recentRealIdles.set(sessionID, Date.now());
      }
    }

    await dispatchToHooks(input);

    const syntheticIdle = normalizeSessionStatusToIdle(input);
    if (syntheticIdle) {
      const sessionID = (syntheticIdle.event.properties as Record<string, unknown>)?.sessionID as string;
      const emittedAt = recentRealIdles.get(sessionID);
      if (emittedAt && Date.now() - emittedAt < DEDUP_WINDOW_MS) {
        recentRealIdles.delete(sessionID);
        return;
      }
      recentSyntheticIdles.set(sessionID, Date.now());
      await dispatchToHooks(syntheticIdle as EventInput);
    }

    const { event } = input;
    const props = event.properties as Record<string, unknown> | undefined;

    if (event.type === "session.created") {
      const sessionInfo = props?.info as { id?: string; title?: string; parentID?: string } | undefined;

      if (!sessionInfo?.parentID) {
        setMainSession(sessionInfo?.id);
      }

      firstMessageVariantGate.markSessionCreated(sessionInfo);
    }

    if (event.type === "session.deleted") {
      const sessionInfo = props?.info as { id?: string } | undefined;
      if (sessionInfo?.id === getMainSessionID()) {
        setMainSession(undefined);
      }

      if (sessionInfo?.id) {
        const wasSyncSubagentSession = syncSubagentSessions.has(sessionInfo.id);
        clearSessionAgent(sessionInfo.id);
        lastKnownModelBySession.delete(sessionInfo.id);
        resetMessageCursor(sessionInfo.id);
        clearBackgroundOutputConsumptionsForParentSession(sessionInfo.id);
        clearBackgroundOutputConsumptionsForTaskSession(sessionInfo.id);
        firstMessageVariantGate.clear(sessionInfo.id);
        clearSessionModel(sessionInfo.id);
        clearSessionPromptParams(sessionInfo.id);
        syncSubagentSessions.delete(sessionInfo.id);
        if (wasSyncSubagentSession) {
          subagentSessions.delete(sessionInfo.id);
        }
        deleteSessionTools(sessionInfo.id);
        await lspManager.cleanupTempDirectoryClients();
      }
    }

    if (event.type === "message.removed") {
      const messageID = props?.messageID as string | undefined;
      const sessionID = props?.sessionID as string | undefined;
      restoreBackgroundOutputConsumption(sessionID, messageID);
    }

    if (event.type === "message.updated") {
      const info = props?.info as Record<string, unknown> | undefined;
      const sessionID = info?.sessionID as string | undefined;
      const agent = info?.agent as string | undefined;
      const role = info?.role as string | undefined;
      if (sessionID && role === "user") {
        const isCompactionMessage = agent ? isCompactionAgent(agent) : false;
        if (agent && !isCompactionMessage) {
          updateSessionAgent(sessionID, agent);
        }
        const providerID = info?.providerID as string | undefined;
        const modelID = info?.modelID as string | undefined;
        if (providerID && modelID && !isCompactionMessage) {
          lastKnownModelBySession.set(sessionID, { providerID, modelID });
          setSessionModel(sessionID, { providerID, modelID });
        }
      }

    }

    if (event.type === "session.error") {
      try {
        const sessionID = props?.sessionID as string | undefined;
        const error = props?.error;

        // First, try session recovery for internal errors (thinking blocks, tool results, etc.)
        if (hooks.sessionRecovery?.isRecoverableError(error)) {
          const messageInfo = {
            id: props?.messageID as string | undefined,
            role: "assistant" as const,
            sessionID,
            error,
          };
          const recovered = await hooks.sessionRecovery.handleSessionRecovery(messageInfo);

          if (recovered && sessionID && sessionID === getMainSessionID()) {
            // Trigger compaction before sending "continue" to avoid double-sending continuation
            await pluginContext.client.session
              .summarize({
                path: { id: sessionID },
                body: { auto: true },
                query: { directory: pluginContext.directory },
              })
              .catch((err: unknown) => {
                log("[event] compaction before recovery continue failed:", { sessionID, error: err });
              });

            await pluginContext.client.session
              .prompt({
                path: { id: sessionID },
                body: { parts: [{ type: "text", text: "continue" }] },
                query: { directory: pluginContext.directory },
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        const sessionID = props?.sessionID as string | undefined;
        log("[event] session.error handler failed:", { sessionID, error: err });
      }
    }
  };
}
