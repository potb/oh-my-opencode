# src/shared/ — Shared Runtime Infrastructure

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Cross-cutting helpers used by agents, plugin glue, tools, and background execution. Mostly flat files exported through `index.ts`, with a few focused subdirectories for heavier subsystems and platform variants.

## STRUCTURE

```text
shared/
├── index.ts                              # Barrel surface
├── logger.ts                             # `/tmp/oh-my-opencode.log` writer
├── model-*.ts                            # Normalization, availability, resolution pipeline
├── session-*.ts                          # Session state, prompt params, tool stores, cursor
├── opencode-*.ts                         # OpenCode config dir, message dir, server auth, storage
├── prompt-*.ts                           # Prompt tools, async timeout, timeout context
├── agent-*.ts                            # Agent permissions, tool restrictions, display names
├── *-cache*.ts                           # JSON file cache, providers cache, vision-models cache
├── data-path.ts, shell-env.ts            # Filesystem + env helpers
├── compaction-marker.ts, system-directive.ts # Compaction + directive helpers
├── deep-merge.ts, contains-path.ts       # Small focused utilities
├── plugin-identity.ts                    # Plugin self-identification
├── internal-initiator-marker.ts          # OMO_INTERNAL_INITIATOR marker
├── dynamic-truncator.ts, truncate-description.ts # Truncation helpers
├── first-message-variant.ts              # First-message routing
├── archive-entry-validator.ts, zip-extractor.ts, zip-entry-listing.ts # Archive helpers
├── binary-downloader.ts                  # Binary fetch helper
├── question-denied-session-permission.ts # Permission helper
├── write-file-atomically.ts              # Atomic file write
├── normalize-sdk-response.ts             # SDK response normalization
├── subagent-session-registry.ts          # Subagent session tracking
├── background-output-consumption.ts      # Background output reader
├── main-session-id.ts                    # Main session id resolver
├── tmux/                                 # tmux integration helpers
├── model-capabilities/                   # Model capability lookups
├── migration/                            # Migration helpers
├── zip-entry-listing/                    # Platform-variant zip listing
└── zauc-mocks-migrate-legacy-plugin/     # Legacy migration mocks
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Logging | `logger.ts` |
| Model selection | `model-resolution-pipeline.ts`, `model-availability.ts`, `model-normalization.ts`, `model-format-normalizer.ts` |
| Session state | `session-prompt-params-state.ts`, `session-tools-store.ts`, `session-model-state.ts`, `session-cursor.ts` |
| OpenCode storage / paths | `data-path.ts`, `opencode-config-dir.ts`, `opencode-storage-paths.ts`, `opencode-storage-detection.ts` |
| Prompt timeouts / tool helpers | `prompt-async-timeout.ts`, `prompt-timeout-context.ts`, `prompt-tools.ts` |
| Process / environment | `shell-env.ts`, `tmux/`, `binary-downloader.ts` |
| Agent permissions / display | `agent-permissions.ts`, `agent-tool-restrictions.ts`, `agent-display-names.ts` |

## CONVENTIONS

- Single-purpose modules over catch-all utility buckets
- `index.ts` is the export surface; behavior lives in named modules
- Tool-family logic belongs in `src/tools/`; plugin glue in `src/plugin/`; only genuinely cross-domain helpers land here
- Subdirectories only when a helper family has platform variants OR a clear internal boundary

## ANTI-PATTERNS

- Adding new generic `utils.ts` / `helpers.ts` files
- Moving domain-specific runtime logic into `shared/` to avoid choosing an owner
- Creating child AGENTS.md files for every helper cluster — this subtree is one ownership unit
