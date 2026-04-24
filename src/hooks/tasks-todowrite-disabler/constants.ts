const HOOK_NAME = "tasks-todowrite-disabler"
export const BLOCKED_TOOLS = ["TodoWrite", "TodoRead"]
export const REPLACEMENT_MESSAGE = `TodoRead/TodoWrite are DISABLED because experimental.task_system is enabled.

**ACTION REQUIRED**: Use the active task system tool surface instead of TodoWrite.

**Use these tools instead:**
- task: delegate concrete work via subagent_type when delegation is needed
- task_list / task_get: inspect the current task system state if available in your environment

**Workflow:**
1. Inspect the current task state
2. Delegate or continue the next concrete unit of work
3. Verify results before reporting completion

DO NOT retry TodoWrite.`
