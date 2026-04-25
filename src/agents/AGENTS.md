# src/agents/ — Built-in Agent Definitions

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Owns built-in agent factories, prompt composition helpers, model-routing logic, and fixed-product agent metadata. Two main families exist: orchestrators (`sisyphus`, `sisyphus-junior`) and specialist subagents (Oracle, Librarian, Explore, Metis, Momus).

## AGENT INVENTORY

| Agent | Mode | Purpose |
|-------|------|---------|
| `sisyphus` | all | Main orchestrator, planning and delegation |
| `sisyphus-junior` | subagent | Focused executor, category-spawned worker |
| `oracle` | subagent | Read-only consultation |
| `librarian` | subagent | External docs/code search |
| `explore` | subagent | Internal codebase grep |
| `metis` | subagent | Pre-planning consultant |
| `momus` | subagent | Plan review / critique |

## STRUCTURE

```text
agents/
├── sisyphus.ts                  # Main orchestrator factory + variant routing
├── sisyphus/                    # Model-specific Sisyphus prompt variants
├── sisyphus-junior/             # Focused executor variants
├── oracle.ts                    # Read-only consultant
├── librarian.ts                 # External reference search
├── explore.ts                   # Internal grep agent
├── metis.ts                     # Pre-planning consultant
├── momus.ts                     # Plan reviewer
├── builtin-agents.ts            # Built-in registry assembly
├── agent-builder.ts             # Final AgentConfig composition
├── dynamic-agent-*.ts           # Shared prompt-section builders
└── builtin-agents/              # Conditional factory helpers / available skills
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Main orchestrator behavior | `sisyphus.ts`, `sisyphus/` | Variant routing by active model |
| Executor behavior | `sisyphus-junior/` | GPT/Gemini/default prompt variants + tool restrictions |
| Agent registry wiring | `builtin-agents.ts`, `agent-builder.ts` | Creation + final assembly |
| Shared prompt sections | `dynamic-agent-core-sections.ts`, `dynamic-agent-policy-sections.ts`, `dynamic-agent-category-skills-guide.ts` | Common policy text |

## CONVENTIONS

- Agent factories return `AgentConfig`; keep heavy prompt text in dedicated variant files.
- Family-specific docs belong in child AGENTS files (`sisyphus/`, `sisyphus-junior/`).
- Tool restrictions are part of agent contracts; document them where they materially affect behavior.

## ANTI-PATTERNS

- Do not mix registry wiring, prompt text, and unrelated helper logic in one file.
- Do not duplicate shared policy text across families when dynamic section builders already own it.
