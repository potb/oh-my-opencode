# src/config/ — Zod Schema System

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Owns configuration schemas and exported types for plugin config loading. Current tree is leaner than older docs: no stale OpenClaw/tmux root-schema entries in this checkout.

## STRUCTURE

```text
config/
├── index.ts
└── schema/
    ├── oh-my-opencode-config.ts   # Root schema
    ├── agent-overrides.ts         # Per-agent overrides
    ├── categories.ts              # Category config
    ├── experimental.ts            # Feature flags and dynamic pruning
    ├── background-task.ts         # Concurrency / timeout config
    ├── git-master.ts              # Git skill config
    ├── browser-automation.ts      # Browser automation provider
    ├── websearch.ts               # Web search provider
    ├── sisyphus.ts                # Sisyphus-specific config
    └── internal/permission.ts     # Permission schema pieces
```

## ROOT SCHEMA FIELDS

`$schema`, `disabled_agents`, `disabled_hooks`, `disabled_tools`, `hashline_edit`, `agents`, `categories`, `experimental`, `background_task`, `git_master`, `browser_automation_engine`, `websearch`, `sisyphus`

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Root config shape | `schema/oh-my-opencode-config.ts` | Single source of truth |
| Agent overrides | `schema/agent-overrides.ts` | Model/prompt/permission overrides |
| Category config | `schema/categories.ts` | Category defaults and custom categories |
| Background task limits | `schema/background-task.ts` | Concurrency, stale timeout, circuit breaker |
| Experimental flags | `schema/experimental.ts` | Dynamic pruning, prompt environment flags |

## CONVENTIONS

- Add new config at `schema/{name}.ts`, then compose it into `oh-my-opencode-config.ts`.
- Keep config docs aligned with actual schema fields; remove stale entries immediately.
- Use `z.infer<typeof Schema>` for exported TS types instead of hand-written duplicates.

## ANTI-PATTERNS

- Do not document removed config keys as active.
- Do not add runtime behavior here; schema modules validate and describe config only.
