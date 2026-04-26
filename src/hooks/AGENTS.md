# src/hooks/ — Lifecycle Hook Implementations

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Owns hook implementations and hook-local helpers. Composition lives in `src/plugin/hooks/`; this directory stays focused on `createXXXHook(deps)` factories plus a small number of standalone utilities.

## STRUCTURE

```text
hooks/
├── anthropic-effort/          # chat.params reasoning-effort adjustment
├── delegate-task-retry/       # delegate-task retry policy helpers
├── edit-error-recovery/       # edit/apply-patch recovery helpers
├── hashline-read-enhancer/    # read-path enrichment around hashline references
├── non-interactive-env/       # non-TTY shell environment injection
├── question-label-truncator/  # compact question labels before tool execution
├── sisyphus-junior-notepad/   # subagent notepad/plan-file protections
├── webfetch-redirect-guard/   # redirect guard for webfetch
├── write-existing-file-guard/ # require prior Read before Write-like operations
├── tool-output-truncator.ts   # standalone post-tool truncation helper
└── index.ts                   # barrel exports only
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Compose hooks into runtime | `src/plugin/hooks/create-*.ts` | Composition boundary is outside this tree |
| Chat/session behavior | `non-interactive-env/`, `sisyphus-junior-notepad/`, `anthropic-effort/` | Per-surface factories |
| Tool guard behavior | `question-label-truncator/`, `webfetch-redirect-guard/`, `write-existing-file-guard/`, `tool-output-truncator.ts` | Pre/post tool enforcement |
| Recovery helpers | `delegate-task-retry/`, `edit-error-recovery/`, `hashline-read-enhancer/` | Support flows used by higher-level handlers |

## CONVENTIONS

- Keep each hook in a dedicated kebab-case subdirectory when it owns tests/helpers.
- `index.ts` files are export surfaces only; runtime registration belongs in `src/plugin/hooks/`.
- Hook factories should stay thin and depend on shared/plugin types rather than owning cross-domain logic.
- If a hook adds a new configurable name, update the config type surface in `src/config/`.

## ANTI-PATTERNS

- Do not move composition logic into `src/hooks/`; this tree owns implementations, not assembly.
- Do not keep stale directory names in docs after hook renames/removals.
- Do not add broad catch-all helpers here when the logic belongs in `src/shared/` or `src/plugin/`.
