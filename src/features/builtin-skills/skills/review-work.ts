import type { BuiltinSkill } from "../types"

export const reviewWorkSkill: BuiltinSkill = {
  name: "review-work",
  description:
    "Post-implementation review orchestrator. Launches 5 parallel background Oracle reviews: goal/constraint verification, execution-readiness review, code quality, security, and context review. All must pass for the review to pass. MUST USE after completing any significant implementation work. Triggers: 'review work', 'review my work', 'review changes', 'QA my work', 'verify implementation', 'check my work', 'validate changes', 'post-implementation review'.",
  template: `# Review Work - 5-Agent Parallel Review Orchestrator

Launch 5 specialized Oracle reviews in parallel to evaluate completed implementation work from every angle. All 5 must pass for the review to pass. If even ONE fails, the review fails.

The 5 agents cover complementary concerns:

1. Goal & Constraint Verification (Oracle)
2. QA Readiness Review (Oracle)
3. Code Quality Review (Oracle)
4. Security Review (Oracle)
5. Context Review (Oracle)

Phase 0: Gather review context
- GOAL
- CONSTRAINTS
- BACKGROUND
- CHANGED_FILES
- DIFF
- FILE_CONTENTS
- RUN_COMMAND if known

Oracle agents cannot read files or run commands. Include all necessary context directly in the prompt.

Phase 1: Launch 5 Agents

Agent 1: Goal & Constraint Verification
Use task(subagent_type="oracle", run_in_background=true, ...)
Review whether the implementation correctly and completely achieves the goal within the given constraints.

Agent 2: QA Readiness Review
Use task(subagent_type="oracle", run_in_background=true, ...)
Do NOT run the app. Instead, enumerate likely P0/P1/P2 test scenarios, identify missing scenarios, and judge whether a real executor would know how to verify the feature from the provided context.

Agent 3: Code Quality Review
Use task(subagent_type="oracle", run_in_background=true, ...)
Review correctness, consistency, readability, error handling, type safety, performance, abstraction level, testing, API design, and introduced tech debt.

Agent 4: Security Review
Use task(subagent_type="oracle", run_in_background=true, ...)
Focus only on security: input validation, auth/authz, secrets, data exposure, dependency risk, crypto, file/path safety, network controls, and error leakage.

Agent 5: Context Review
Use task(subagent_type="oracle", run_in_background=true, ...)
Review the provided goal, constraints, background, changed files, and diff to identify missing assumptions, ignored prior decisions, or omitted related behavior.

Phase 2: Wait & Collect
After launching all 5 agents in one turn, end your response and wait for system notifications.

Phase 3: Deliver Verdict
If all 5 return PASS, review passed.
If any agent returns FAIL, review failed.

Compile the final report with overall verdict, per-agent verdicts, blocking issues, key findings, and recommendations.`,
}
