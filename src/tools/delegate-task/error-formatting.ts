import type { DelegateTaskArgs } from "./types"

/**
 * Context for error formatting.
 */
interface ErrorContext {
  operation: string
  args?: DelegateTaskArgs
  sessionID?: string
  agent?: string
}

/**
 * Format an error with detailed context for debugging.
 */
export function formatDetailedError(error: unknown, ctx: ErrorContext): string {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  const lines: string[] = [`${ctx.operation} failed`, "", `**Error**: ${message}`]

  if (ctx.sessionID) {
    lines.push(`**Session ID**: ${ctx.sessionID}`)
  }

  if (ctx.agent) {
    lines.push(`**Agent**: ${ctx.agent}`)
  }

  if (ctx.args) {
    lines.push("", "**Arguments**:")
    lines.push(`- description: "${ctx.args.description}"`)
    lines.push(`- subagent_type: ${ctx.args.subagent_type ?? "(none)"}`)
    lines.push(`- run_in_background: ${ctx.args.run_in_background}`)
    if (ctx.args.session_id) {
      lines.push(`- session_id: ${ctx.args.session_id}`)
    }
  }

  if (stack) {
    lines.push("", "**Stack Trace**:")
    lines.push("```")
    lines.push(stack.split("\n").slice(0, 10).join("\n"))
    lines.push("```")
  }

  return lines.join("\n")
}
