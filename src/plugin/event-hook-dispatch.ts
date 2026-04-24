import type { CreatedHooks } from "../create-hooks"
import type { Managers } from "../create-managers"

import { log } from "../shared/logger"

type EventInput = Parameters<
  NonNullable<NonNullable<CreatedHooks["writeExistingFileGuard"]>["event"]>
>[0]

function getEventSessionID(input: EventInput): string | undefined {
  const properties = input.event.properties
  if (
    !properties ||
    typeof properties !== "object" ||
    !("sessionID" in properties) ||
    typeof properties.sessionID !== "string"
  ) {
    return undefined
  }

  return properties.sessionID
}

async function runEventHookSafely(
  hookName: string,
  handler: ((input: EventInput) => unknown | Promise<unknown>) | null | undefined,
  input: EventInput,
): Promise<void> {
  if (!handler) return

  try {
    await Promise.resolve(handler(input))
  } catch (error) {
    log("[event] hook execution failed", {
      hook: hookName,
      eventType: input.event.type,
      sessionID: getEventSessionID(input),
      error,
    })
  }
}

export async function dispatchEventHooks(args: {
  input: EventInput
  hooks: CreatedHooks
  managers: Managers
}): Promise<void> {
  const { input, hooks, managers } = args

  try {
    managers.backgroundManager.handleEvent(input.event)
  } catch (error) {
    log("[event] background manager event handling failed", {
      eventType: input.event.type,
      sessionID: getEventSessionID(input),
      error,
    })
  }

  await runEventHookSafely("writeExistingFileGuard", hooks.writeExistingFileGuard?.event, input)
}
