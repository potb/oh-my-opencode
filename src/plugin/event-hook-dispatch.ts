import type { CreatedHooks } from "../create-hooks"
import type { Managers } from "../create-managers"

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

async function runEventHook(
  hookName: string,
  handler: ((input: EventInput) => unknown | Promise<unknown>) | null | undefined,
  input: EventInput,
): Promise<void> {
  if (!handler) return
  await Promise.resolve(handler(input))
}

function getEventHookEntries(hooks: CreatedHooks): Array<[
  string,
  (input: EventInput) => unknown | Promise<unknown>,
]> {
  return Object.entries(hooks).flatMap(([hookName, hookValue]) => {
    if (!hookValue || typeof hookValue !== "object") {
      return []
    }

    const eventHandler = (hookValue as { event?: unknown }).event
    if (typeof eventHandler !== "function") {
      return []
    }

    return [[hookName, eventHandler as (input: EventInput) => unknown | Promise<unknown>]]
  })
}

export async function dispatchEventHooks(args: {
  input: EventInput
  hooks: CreatedHooks
  managers: Managers
}): Promise<void> {
  const { input, hooks, managers } = args

  await managers.backgroundManager.handleEvent(input.event)

  for (const [hookName, eventHandler] of getEventHookEntries(hooks)) {
    await runEventHook(hookName, eventHandler, input)
  }
}
