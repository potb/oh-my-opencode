# src/config/ — Type Definitions Only

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Owns runtime config TYPE shapes. No file loading, no JSONC parsing, no validation, no defaults. Runtime values come from the single TS constant in `src/plugin-config.ts`.

## STRUCTURE

```text
config/
├── index.ts            # Barrel exports
├── types.ts            # All config type definitions
└── schema/internal/    # Reserved (currently empty)
```

## ROOT CONFIG FIELDS (`OhMyOpenCodeConfig`)

`disabled_agents`, `disabled_hooks`, `disabled_tools`, `agents`, `categories`, `experimental`, `background_task`, `git_master`, `browser_automation_engine`.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add a new config field | `types.ts` then update `src/plugin-config.ts` constant |
| Change a runtime value | `src/plugin-config.ts` (NOT here) |
| Validate consumer expectations | Compile-time via `tsc`; no runtime validators |

## ANTI-PATTERNS

- Adding runtime file loaders, JSONC parsers, or fallback defaults
- Adding runtime validation here — schemas only
- Letting `schema/internal/` host runtime code; keep it for reserved type artifacts
