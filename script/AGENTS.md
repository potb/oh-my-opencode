# script/ — Build and CI Automation

**Generated:** 2026-04-25 | **Commit:** 51061ac8

## OVERVIEW

Small, high-signal automation directory. Owns schema generation and the CI test-splitting runner. Directory name is intentionally singular: `script/`, not `scripts/`.

## FILES

| File | Purpose |
|------|---------|
| `build-schema.ts` | Write JSON schema to `assets/` and `dist/` |
| `build-schema-document.ts` | Build trimmed schema document from Zod root schema |
| `build-schema.test.ts` | Verify generated schema shape |
| `run-ci-tests.ts` | Split Bun tests into isolated vs shared runs |
| `tsconfig.json` | Script-local TS config |

## CI TEST SPLIT RULES

- Test roots: `bin`, `script`, `src`
- Isolation trigger: file contains `mock.module(`
- Always-isolated constant: `src/openclaw/__tests__/reply-listener-discord.test.ts` when that file exists in the checkout
- Shared suite runs after isolated targets
- Directory targets exclude nested `_auc-*` test directories during grouped runs

## COMMANDS

```bash
bun run build:schema         # Execute script/build-schema.ts
bun run script/run-ci-tests.ts
bun run script/run-ci-tests.ts --print-plan
```

## CONVENTIONS

- Keep scripts copy-paste runnable from repo root.
- Script files should stay operationally focused; no grab-bag helpers.
- If CI behavior changes, update this file and root `AGENTS.md` together.
