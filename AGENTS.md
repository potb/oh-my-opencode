# oh-my-opencode — OpenCode Plugin

**Generated:** 2026-04-26 | **Commit:** 5af01eb4 | **Branch:** dev

## OVERVIEW

Bun-first TypeScript OpenCode plugin: multi-agent orchestration, background task engine, hook composition, custom tool wiring, fixed-product runtime constraints. Single source `src/`, co-located tests, knip-checked exports.

## STRUCTURE

```text
oh-my-opencode/
├── src/             # Plugin source: bootstrap, agents, config, features, hooks, plugin glue, shared, tools
├── tests/           # Non-co-located harnesses and module-mock helpers
├── test-setup.ts    # Bun test preload (registered via bunfig.toml)
├── bun-test.d.ts    # Bun test type augmentations
├── bunfig.toml      # `[test]` preload pointer
├── knip.ts          # Unused-export checker config (entries + ignored paths)
├── tsconfig.json    # ESNext, bundler resolution, bun-types, excludes *.test.ts
└── package.json     # ESM-only, version 3.17.2, custom build script
```

Empty in checkout: `src/testing/`, `src/tools/hashline-edit/`, `src/config/schema/internal/`, `tests/hashline/`. Do not document these as live modules.

## INITIALIZATION FLOW

```text
src/index.ts → OhMyOpenCodePlugin(ctx)
  ├─→ PLUGIN_CONFIG          # constant from src/plugin-config.ts
  ├─→ createManagers()       # BackgroundManager + runtime config hook
  ├─→ createTools()          # → createToolRegistry()
  ├─→ createHooks()          # → src/plugin/hooks/create-core-hooks.ts
  └─→ createPluginInterface() # 10 OpenCode hook surfaces
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Plugin bootstrap | `src/index.ts`, `src/plugin-interface.ts`, `src/plugin-dispose.ts` | Startup + 10 hook surfaces + cleanup |
| Runtime config constant | `src/plugin-config.ts` | Sole source of truth for config values |
| Config types | `src/config/types.ts` | Plain TS types only, no runtime loading |
| Background task engine | `src/features/background-agent/` | Concurrency, polling, stale cleanup, notifications |
| Agent definitions | `src/agents/` | Sisyphus family + Oracle/Librarian/Explore/Metis/Momus |
| Hook implementations | `src/hooks/` | Per-domain factories |
| Hook composition | `src/plugin/hooks/` | Assembles hooks into runtime record |
| Tool registry | `src/plugin/tool-registry.ts`, `src/create-tools.ts` | Registry boundary |
| Tool families | `src/tools/` | delegate-task, lsp, ast-grep, grep, glob |
| Shared runtime helpers | `src/shared/` | Logger, model resolution, session helpers |
| Builtin skills | `src/features/builtin-skills/` | git-master, agent-browser, frontend-ui-ux, review-work |

## PLUGIN INTERFACE — 10 HOOK SURFACES

`tool`, `config`, `chat.message`, `chat.params`, `chat.headers`, `event`, `tool.execute.before`, `tool.execute.after`, `experimental.chat.messages.transform`, `experimental.chat.system.transform`.

## CONVENTIONS

- Runtime: Bun only; ESM-only (`type: "module"`)
- TypeScript: strict, ESNext, `moduleResolution: bundler`, `types: ["bun-types"]`
- Tests: co-located `*.test.ts` excluded from build; preload via `bunfig.toml` → `test-setup.ts`
- Naming: kebab-case files and directories
- Factories: `createXXX()` for tools, hooks, managers, agents
- Imports: relative paths only; no `@/` aliases
- `index.ts`: entry / barrel / wiring only — no implementation
- Hook composition: `src/create-hooks.ts` delegates to `src/plugin/hooks/create-core-hooks.ts`
- Config: edit `src/plugin-config.ts` for values; `src/config/types.ts` for shapes
- Knip: edit `knip.ts` ignore list when adding intentionally unused exports
- Update the nearest owning `AGENTS.md` when structure or responsibilities change

## ANTI-PATTERNS

- `as any`, `@ts-ignore`, `@ts-expect-error` in production code (mock-only exceptions in tests)
- Empty `catch {}` blocks
- Direct `bun publish`
- Local `package.json` version bumps for releases
- Arrange-Act-Assert comments in tests
- Emojis / em-dashes / AI filler prose in generated content unless explicitly requested
- Committing without explicit user request
- New catch-all `utils.ts` / `helpers.ts` / `service.ts` files
- Adding runtime logic to `src/plugin/tool-registry.ts` (registry boundary only)

## COMMANDS

```bash
bun test                         # Full Bun test suite (co-located *.test.ts)
bun run build                    # rm -rf dist + bun build ESM + tsc declarations
bun run typecheck                # tsc --noEmit
bun run knip                     # Unused export / file detection
bun run clean                    # rm -rf dist
```

Build externalizes `@ast-grep/napi`. Declarations emitted via `tsc --emitDeclarationOnly` after `bun build`.

## AGENTS HIERARCHY

- `AGENTS.md` (this file)
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
- `src/plugin/AGENTS.md`
- `src/shared/AGENTS.md`
- `src/tools/AGENTS.md`
- `src/tools/delegate-task/AGENTS.md`
- `src/tools/lsp/AGENTS.md`
- `tests/AGENTS.md`

## DOCUMENTATION POLICY

- This file owns repo-wide structure, conventions, commands, and AGENTS index.
- Children own domain-specific contracts only; never repeat parent content.
- Remove stale path references immediately when modules disappear or move.
- Telegraphic style: tables and bullets, no prose paragraphs.

## NOTES

- Logger writes to `/tmp/oh-my-opencode.log`
- No ESLint / Prettier / Biome config present; rely on `tsc` + `knip` for static checks
- No `.github/`, `script/`, `docs/`, `packages/`, `bin/`, `assets/`, `signatures/`, `dist/`, `.opencode/`, `.sisyphus/` directories in this checkout
- License: SUL-1.0; author: YeonGyu-Kim
