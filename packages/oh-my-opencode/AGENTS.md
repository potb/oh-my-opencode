# packages/oh-my-opencode — Full Plugin Package

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Publishable package for the full batteries-included `OhMyOpenCodePlugin`.

## ENTRYPOINT

| File | Role |
|------|------|
| `src/index.ts` | Imports `../../../src/index`, narrows to OpenCode `Plugin`, exports default |
| `package.json` | Package name `oh-my-opencode`; root export points to `dist/index.{js,d.ts}` |

## CONTRACTS

- Preserve this package as a thin adapter over `src/index.ts`.
- Keep implementation changes in root `src/`, not in this package wrapper.
- Runtime deps mirror the full plugin needs: OpenCode plugin API, ast-grep CLI, JSON-RPC.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Full plugin behavior | `../../src/index.ts` |
| Hook surface assembly | `../../src/plugin-interface.ts` |
| Tool registration | `../../src/plugin/tool-registry.ts` |
| Package build output | `dist/index.{js,d.ts}` after root build |

## ANTI-PATTERNS

- Adding hooks, tools, or config logic here.
- Reintroducing package subpath exports for internal surfaces.
- Diverging package version from the workspace/root release version.
