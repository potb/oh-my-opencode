# src/shared/ — Shared Runtime Infrastructure

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Cross-cutting runtime helpers used across agents, plugin glue, tools, and background execution. Most modules are flat files exported through `index.ts`, with a few focused subdirectories for heavier subsystems.

## STRUCTURE

```text
shared/
├── index.ts                    # barrel export surface
├── logger.ts                   # `/tmp/oh-my-opencode.log`
├── model-*.ts                  # model normalization, availability, resolution
├── session-*.ts                # session state, prompt params, tool stores
├── opencode-*.ts               # config/message/auth/storage helpers
├── prompt-*.ts                 # prompt tool/timeouts/context helpers
├── posthog*.ts                 # telemetry activity state
├── tmux/                       # tmux/process integration helpers
├── model-capabilities/         # model capability lookups
├── migration/                  # migration helpers
├── zip-entry-listing/          # platform-specific zip listing backends
└── zauc-mocks-migrate-legacy-plugin/ # legacy migration support
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Logging and operator traces | `logger.ts` | Writes to `/tmp/oh-my-opencode.log` |
| Model selection pipeline | `model-resolution-pipeline.ts`, `model-availability.ts`, `model-normalization.ts` | Core model routing helpers |
| Session state helpers | `session-*.ts`, `session-tools-store.ts`, `session-cursor.ts` | Prompt/session continuity |
| Path and config resolution | `data-path.ts`, `opencode-config-dir.ts`, `opencode-storage-*.ts` | XDG/runtime storage |
| Prompt/tool helper state | `prompt-tools.ts`, `prompt-async-timeout.ts`, `context-limit-resolver.ts` | Shared prompt execution support |
| Shell/tmux/process helpers | `shell-env.ts`, `tmux/`, `binary-downloader.ts` | Environment/process integration |

## CONVENTIONS

- Prefer focused single-purpose modules over catch-all utility buckets.
- Keep `index.ts` as the export surface; heavy behavior stays in named modules.
- Put tool-family logic in `src/tools/` and plugin glue in `src/plugin/`; `src/shared/` is only for genuinely cross-domain helpers.
- Small subdirectories are allowed only when a helper family has platform variants or a clear internal boundary.

## ANTI-PATTERNS

- Do not add new generic `utils.ts`/`helpers.ts` files here.
- Do not move domain-specific runtime logic into `shared/` just to avoid choosing an owner.
- Do not create child AGENTS files for every helper cluster; this subtree remains intentionally documented as one ownership unit.
