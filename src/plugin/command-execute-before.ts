import type { CreatedHooks } from "../create-hooks"

type CommandExecuteBeforeInput = {
  command: string
  sessionID: string
  arguments: string
}

type CommandExecuteBeforeOutput = {
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>
  message?: Record<string, unknown>
}

export function createCommandExecuteBeforeHandler(args: {
  hooks: CreatedHooks
}): (
  input: CommandExecuteBeforeInput,
  output: CommandExecuteBeforeOutput,
) => Promise<void> {
  const { hooks } = args

  return async (input, output): Promise<void> => {
    void hooks
    void input
    void output
  }
}
