# src/shared/model-capabilities/ — Model Capability Readers

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Small focused shared subdomain for reading, normalizing, and exposing model capability data. Parent `src/shared/AGENTS.md` covers broader shared infrastructure; this child owns only capability-specific logic.

## FILES

| File | Purpose |
|------|---------|
| `index.ts` | Re-export `getModelCapabilities` |
| `get-model-capabilities.ts` | Primary public entry point |
| `runtime-model-readers.ts` | Runtime-side capability extraction |
| `bundled-snapshot.ts` | Bundled capability snapshot source |
| `types.ts` | Capability types |

## WHEN TO LOOK HERE

- Capability lookup behavior disagrees with provider/runtime expectations
- Snapshot vs runtime capability data needs debugging
- Shared callers need the public capability contract

## ANTI-PATTERNS

- Mixing unrelated model-resolution fallback policy into this subtree
- Bypassing `get-model-capabilities.ts` with ad hoc readers in unrelated modules
