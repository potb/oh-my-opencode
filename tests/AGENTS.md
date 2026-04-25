# tests/ — Extra Integration Harnesses

**Generated:** 2026-04-25 | **Commit:** 51061ac8

## OVERVIEW

This directory is for test harnesses that do not fit the normal co-located `*.test.ts` pattern. Current focus is a small module-mock lifecycle helper.

## STRUCTURE

```text
tests/
└── module-mock-lifecycle.ts # Shared helper for module-mock behavior tests
```

## WHEN TO PUT TESTS HERE

- Needs separate package metadata or lockfile
- Exercises integration behavior across tool/model boundaries
- Does not belong next to one source module

## WHEN NOT TO PUT TESTS HERE

- Normal unit tests for `src/**` files
- Standard Bun tests that can live beside implementation
- Generic helpers better placed in `test-setup.ts`
