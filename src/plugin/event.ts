import type { OhMyOpenCodeConfig } from "../config";
import type { PluginContext } from "./types";

import {
  getMainSessionID,
  setMainSessionID,
} from "../shared/main-session-id";
import {
  clearBackgroundOutputConsumptionsForParentSession,
  clearBackgroundOutputConsumptionsForTaskSession,
  restoreBackgroundOutputConsumption,
} from "../shared/background-output-consumption";
import { resetMessageCursor } from "../shared";
import { log } from "../shared/logger";
import { clearSessionModel, setSessionModel } from "../shared/session-model-state";
import { clearSessionPromptParams } from "../shared/session-prompt-params-state";
import { removeSubagentSession } from "../shared/subagent-session-registry";
import { deleteSessionTools } from "../shared/session-tools-store";
import { lspManager } from "../tools";
import { dispatchEventHooks } from "./event-hook-dispatch";

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

    await dispatchEventHooks({ input, hooks, managers });

    const syntheticIdle = normalizeSessionStatusToIdle(input);
    if (syntheticIdle) {
      const sessionID = (syntheticIdle.event.properties as Record<string, unknown>)?.sessionID as string;
      const emittedAt = recentRealIdles.get(sessionID);
      if (emittedAt && Date.now() - emittedAt < DEDUP_WINDOW_MS) {
        recentRealIdles.delete(sessionID);
        return;
      }
      recentSyntheticIdles.set(sessionID, Date.now());
      await dispatchEventHooks({ input: syntheticIdle as EventInput, hooks, managers });
    }

    const { event } = input;
    const props = event.properties as Record<string, unknown> | undefined;

    if (event.type === "session.created") {
      const sessionInfo = props?.info as { id?: string; title?: string; parentID?: string } | undefined;

      if (!sessionInfo?.parentID) {
        setMainSessionID(sessionInfo?.id);
      }

      firstMessageVariantGate.markSessionCreated(sessionInfo);
    }

    if (event.type === "session.deleted") {
      const sessionInfo = props?.info as { id?: string } | undefined;
      if (sessionInfo?.id === getMainSessionID()) {
        setMainSessionID(undefined);
      }

      if (sessionInfo?.id) {
        lastKnownModelBySession.delete(sessionInfo.id);
        resetMessageCursor(sessionInfo.id);
        clearBackgroundOutputConsumptionsForParentSession(sessionInfo.id);
        clearBackgroundOutputConsumptionsForTaskSession(sessionInfo.id);
        firstMessageVariantGate.clear(sessionInfo.id);
        clearSessionModel(sessionInfo.id);
        clearSessionPromptParams(sessionInfo.id);
        removeSubagentSession(sessionInfo.id);
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
        const providerID = info?.providerID as string | undefined;
        const modelID = info?.modelID as string | undefined;
        if (providerID && modelID && !isCompactionMessage) {
          lastKnownModelBySession.set(sessionID, { providerID, modelID });
          setSessionModel(sessionID, { providerID, modelID });
        }
      }

    }
  };
}
