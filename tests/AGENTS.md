# tests/ — Extra Integration Harnesses

**Generated:** 2026-04-25 | **Commit:** 51061ac8

## OVERVIEW

This directory is for test harnesses that do not fit the normal co-located `*.test.ts` pattern. Current focus is hashline integration coverage plus a small module-mock lifecycle helper.

## STRUCTURE

```text
tests/
├── hashline/                # Separate Bun package for hashline integration scenarios
└── module-mock-lifecycle.ts # Shared helper for module-mock behavior tests
```

## HASHLINE SUBDOMAIN

`tests/hashline/` contains its own `package.json` and `bun.lock`.

Scripts:
- `test:basic` → `bun run test-edit-ops.ts`
- `test:edge` → `bun run test-edge-cases.ts`
- `test:multi` → `bun run test-multi-model.ts`
- `test:all` → basic + edge

Use this area for integration-style hashline scenarios that need a package-local dependency set or multi-model experiments.

## WHEN TO PUT TESTS HERE

- Needs separate package metadata or lockfile
- Exercises integration behavior across tool/model boundaries
- Does not belong next to one source module

## WHEN NOT TO PUT TESTS HERE

- Normal unit tests for `src/**` files
- Standard Bun tests that can live beside implementation
- Generic helpers better placed in `test-setup.ts`
