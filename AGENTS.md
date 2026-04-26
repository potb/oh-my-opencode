# oh-my-opencode — OpenCode Plugin

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf | **Branch:** dev

## OVERVIEW

Bun-first TypeScript OpenCode plugin for multi-agent orchestration, background task execution, hook composition, custom tool wiring, and fixed-product runtime constraints. Current checkout is large and modular, with deep source hierarchy plus project-installed skills, authored docs, and release artifacts.

## STRUCTURE

```text
oh-my-opencode/
├── src/         # Plugin source: bootstrap, agents, config, features, hooks, plugin glue, shared infra, tools
├── script/      # Schema generation and CI test runner
├── tests/       # Extra integration harnesses outside co-located *.test.ts
├── docs/        # Authored product docs, examples, guides, and troubleshooting
├── packages/    # Platform-specific packaged artifacts
├── dist/        # Built output mirroring src/
├── .opencode/   # Project runtime config, custom commands, and installed skills
├── .sisyphus/   # Reserved agent workspace state dir (currently empty)
├── .github/     # Issue templates, assets, and repo automation surface
├── bin/         # Binary/test entrypoints
├── assets/      # Generated schema + static assets
└── signatures/  # Release/signing artifacts
```

## INITIALIZATION FLOW

```text
OhMyOpenCodePlugin(ctx)
  ├─→ PLUGIN_CONFIG          # single TS constant from plugin-config.ts
  ├─→ createManagers()
  ├─→ createTools()
  ├─→ createHooks()
  └─→ createPluginInterface()
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Plugin bootstrap | `src/index.ts`, `src/plugin-interface.ts` | End-to-end startup and 10 hook surfaces |
| Config constants | `src/plugin-config.ts`, `src/config/types.ts` | Single TS config constant, plain TypeScript type definitions |
| Background task engine | `src/features/background-agent/` | Concurrency, polling, stale-task cleanup, notifications |
| Agent definitions | `src/agents/` | Sisyphus family + Oracle/Librarian/Explore/Metis/Momus |
| Hook behavior | `src/hooks/`, `src/plugin/hooks/` | Hook implementations vs composition glue |
| Tool registration | `src/create-tools.ts`, `src/plugin/tool-registry.ts`, `src/tools/` | Registry boundary and tool families |
| Shared runtime helpers | `src/shared/` | Logging, caches, model resolution, session helpers |
| CI scripts | `script/` | `run-ci-tests.ts` |
| Extra integration harnesses | `tests/` | Non-co-located harness helpers when needed |
| Authored product docs | `docs/` | Human-facing docs only; not runtime source |
| Project skill/runtime config | `.opencode/` | Project config plus installed skill assets |
| Repo automation | `.github/` | Issue templates and workflow surface; workflows dir currently empty |

## CONVENTIONS

- Runtime: Bun only
- TypeScript: strict, ESNext, bundler resolution, `bun-types`
- Tests: co-located `*.test.ts` plus extra harnesses in `tests/`
- CI: `script/run-ci-tests.ts` isolates `mock.module()` tests
- Naming: kebab-case files/directories
- Factories: `createXXX()` for tools, hooks, managers, agents
- Imports: relative paths, no `@/` aliases
- `index.ts`: entry/barrel/wiring only
- `create-hooks.ts` delegates composition to `src/plugin/hooks/create-core-hooks.ts`
- Prefer focused modules over grab-bag helpers; some legacy localized `utils` files exist, do not expand that pattern
- Update the nearest owning `AGENTS.md` when structure or responsibilities change

## ANTI-PATTERNS

- `as any`, `@ts-ignore`, `@ts-expect-error`
- empty `catch {}` blocks
- direct `bun publish`
- local `package.json` version bumps for releases
- Arrange-Act-Assert comments in tests
- emojis / AI filler prose / em dashes in generated content unless explicitly requested
- committing without explicit user request
- adding new catch-all `utils.ts` / `helpers.ts` / `service.ts`

## COMMANDS

```bash
bun test                              # Full Bun test suite
bun run build                         # ESM build + declarations
bun run typecheck                     # tsc --noEmit
bun run script/run-ci-tests.ts        # CI-style split test execution
bun run script/run-ci-tests.ts --print-plan
```

## AGENTS HIERARCHY

- `src/AGENTS.md`
- `src/agents/AGENTS.md`
- `src/agents/sisyphus/AGENTS.md`
- `src/agents/sisyphus-junior/AGENTS.md`
- `src/config/AGENTS.md`
- `src/features/AGENTS.md`
- `src/features/background-agent/AGENTS.md`
- `src/features/builtin-skills/AGENTS.md`
- `src/features/builtin-skills/skills/git-master-sections/AGENTS.md`
- `src/hooks/AGENTS.md`
- `docs/AGENTS.md`
- `.opencode/AGENTS.md`
- `src/plugin/AGENTS.md`
- `src/shared/AGENTS.md`
- `src/tools/AGENTS.md`
- `src/tools/delegate-task/AGENTS.md`
- `src/tools/lsp/AGENTS.md`
- `script/AGENTS.md`
- `tests/AGENTS.md`

## DOCUMENTATION POLICY

- Root file owns repo-wide structure, conventions, commands, and AGENTS index.
- Child files own domain-specific contracts only.
- Link downward; do not repeat parent content.
- Remove stale path references immediately when modules disappear or move.

## NOTES

- Logger output: `/tmp/oh-my-opencode.log`
- `.github/workflows/` currently exists but is empty in this checkout
- `.sisyphus/` currently exists but is empty in this checkout
