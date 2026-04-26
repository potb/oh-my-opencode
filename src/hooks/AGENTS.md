# src/hooks/ — Lifecycle Hook Implementations

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Per-domain hook factories. Composition lives outside this tree (in `src/plugin/hooks/`). This directory stays focused on `createXXXHook(deps)` factories plus a small set of standalone helpers.

## STRUCTURE

```text
hooks/
├── anthropic-effort/             # chat.params reasoning-effort adjustment
├── delegate-task-retry/          # delegate-task retry policy helpers
├── edit-error-recovery/          # edit / apply-patch failure recovery
├── hashline-read-enhancer/       # hashline reference enrichment in reads
├── non-interactive-env/          # non-TTY shell environment injection
├── question-label-truncator/     # compact question labels before tool execute
├── sisyphus-junior-notepad/      # Junior subagent notepad / plan-file guard
├── webfetch-redirect-guard/      # redirect guard for webfetch tool
├── write-existing-file-guard/    # require prior Read before Write-like ops
├── tool-output-truncator.ts      # standalone post-tool truncation helper
├── tool-output-truncator.test.ts # co-located test for the truncator
└── index.ts                      # Barrel only
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Compose hooks into runtime | `src/plugin/hooks/create-*.ts` (NOT here) |
| Pre-tool guards | `write-existing-file-guard/`, `webfetch-redirect-guard/`, `question-label-truncator/` |
| Post-tool processing | `tool-output-truncator.ts` |
| Recovery flows | `delegate-task-retry/`, `edit-error-recovery/`, `hashline-read-enhancer/` |
| Session / env shaping | `non-interactive-env/`, `sisyphus-junior-notepad/`, `anthropic-effort/` |

## CONVENTIONS

- Each non-trivial hook gets a kebab-case subdirectory (own tests + helpers)
- `index.ts` files are export surfaces only — runtime registration lives in `src/plugin/hooks/`
- Keep factories thin; depend on shared/plugin types rather than owning cross-domain logic
- New configurable hook name → also update `src/config/types.ts`

## ANTI-PATTERNS

- Moving composition logic into this tree
- Adding broad catch-all helpers when the logic belongs in `src/shared/` or `src/plugin/`
- Leaving stale subdirectory references in docs after rename / removal
