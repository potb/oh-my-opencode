# src/config/ — Type Definition System

**Generated:** 2026-04-25

## OVERVIEW

Owns configuration type definitions via plain TypeScript types and interfaces. No runtime file loading or validation happens here; all config values come from the explicit constant in `src/plugin-config.ts`.

## STRUCTURE

```text
config/
├── index.ts
└── types.ts
```

## ROOT CONFIG FIELDS

`disabled_agents`, `disabled_hooks`, `disabled_tools`, `agents`, `categories`, `experimental`, `background_task`, `git_master`, `browser_automation_engine`

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Root config shape | `types.ts` | Type definitions only |
| Change config values | `src/plugin-config.ts` | Single source of truth for runtime config |

## CONVENTIONS

- Add new config types in `types.ts`.
- Keep shapes aligned with the runtime config constant in `src/plugin-config.ts`.
- Edit `src/plugin-config.ts` to change runtime behavior; this directory defines types only.

## ANTI-PATTERNS

- Do not add runtime file loading, JSONC parsing, or fallback defaults here.
- Do not add runtime validation here; type modules define shapes only.
