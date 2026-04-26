# src/agents/ — Built-in Agent Definitions

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Agent factories, model-routed prompt variants, dynamic prompt-section builders, and built-in registry assembly. Two families: orchestrators (sisyphus, sisyphus-junior) and specialist subagents (oracle, librarian, explore, metis, momus).

## AGENT INVENTORY

| Agent | File | Mode | Purpose |
|-------|------|------|---------|
| sisyphus | `sisyphus.ts` + `sisyphus/` | all | Main orchestrator — plans + delegates |
| sisyphus-junior | `sisyphus-junior/` | subagent | Focused executor — never delegates onward |
| oracle | `oracle.ts` | subagent | Read-only consultation |
| librarian | `librarian.ts` | subagent | External docs/code search |
| explore | `explore.ts` | subagent | Internal codebase grep |
| metis | `metis.ts` | subagent | Pre-planning consultant |
| momus | `momus.ts` + `momus.test.ts` | subagent | Plan reviewer / critic |

## STRUCTURE

```text
agents/
├── sisyphus.ts                          # Main orchestrator + variant routing
├── sisyphus/                            # Sisyphus prompt variants (default, gemini, gpt-5-4)
├── sisyphus-junior/                     # Junior executor variants
├── oracle.ts, librarian.ts, explore.ts  # Specialist factories
├── metis.ts, momus.ts                   # Planning + review specialists
├── builtin-agents.ts                    # Built-in registry assembly
├── builtin-agents/                      # Sisyphus agent override, available skills, model resolution
├── agent-builder.ts                     # Final AgentConfig composition
├── dynamic-agent-prompt-builder.ts      # Build prompts from core+policy+category sections
├── dynamic-agent-core-sections.ts       # Identity, mode, delegation core text
├── dynamic-agent-policy-sections.ts     # Tool-usage / anti-duplication policy text
├── dynamic-agent-category-skills-guide.ts # Category + skills guidance
├── dynamic-agent-tool-categorization.ts # Tool grouping for prompts
├── dynamic-agent-prompt-types.ts        # Prompt-builder types
├── env-context.ts                       # OS/locale/cwd context for prompts
├── gpt-apply-patch-guard.ts             # Block apply_patch on GPT variants
├── types.ts                             # Agent + delegation types
└── index.ts                             # Barrel exports
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Change orchestrator prompt | `sisyphus/` variant file |
| Change executor prompt | `sisyphus-junior/` variant file |
| Add a new specialist agent | New `*.ts` factory + register in `builtin-agents.ts` |
| Edit shared policy text | `dynamic-agent-policy-sections.ts` |
| Edit identity / mode preamble | `dynamic-agent-core-sections.ts` |
| Resolve agent model | `builtin-agents/model-resolution.ts` |
| Compose final AgentConfig | `agent-builder.ts` |

## CONVENTIONS

- Factories return `AgentConfig`; heavy prompt text lives in dedicated variant files
- Tool restrictions are part of the agent contract — document where behavior changes
- New specialists get a single top-level `*.ts`; add subdirectory only when prompt variants split

## ANTI-PATTERNS

- Mixing registry wiring, prompt text, and helper logic in one file
- Duplicating shared policy text across families when dynamic section builders own it
- Letting subagents (`mode: subagent`) call other subagents
