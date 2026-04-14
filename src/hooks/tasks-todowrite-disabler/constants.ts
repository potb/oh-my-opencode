export const HOOK_NAME = "tasks-todowrite-disabler"
export const BLOCKED_TOOLS = ["TodoWrite", "TodoRead"]
export const REPLACEMENT_MESSAGE = `TodoRead/TodoWrite are DISABLED because experimental.task_system is enabled.

**ACTION REQUIRED**: RE-REGISTER what you were about to write as Todo using Task tools NOW. Then ASSIGN yourself and START WORKING immediately.

**Use these tools instead:**
- task_create: Create new task with auto-generated ID
- task_update: Update status, assign owner, add dependencies
- task_list: List active tasks with dependency info
- task_get: Get full task details

**Workflow:**
1. task_create({ subject: "your task description" })
2. task_update({ id: "T-xxx", status: "in_progress", owner: "your-thread-id" })
3. DO THE WORK
4. task_update({ id: "T-xxx", status: "completed" })

CRITICAL: 1 task = 1 task. Fire independent tasks concurrently.

**STOP! DO NOT START WORKING DIRECTLY - NO MATTER HOW SMALL THE TASK!**
Even if the task seems trivial (1 line fix, simple edit, quick change), you MUST:
1. FIRST register it with task_create
2. THEN mark it in_progress
3. ONLY THEN do the actual work
4. FINALLY mark it completed

**WHY?** Task tracking = visibility = accountability. Skipping registration = invisible work = chaos.

DO NOT retry TodoWrite. Convert to task_create NOW.`
