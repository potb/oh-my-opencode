# tests/ — Non-Co-Located Test Harnesses

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Reserved for test code that does not fit the standard co-located `*.test.ts` pattern. Most plugin tests live next to their implementation in `src/`; this directory holds only shared module-mock lifecycle helpers and reserved harness areas.

## STRUCTURE

```text
tests/
├── module-mock-lifecycle.ts  # Shared helper for tests that use Bun's `mock.module()`
└── hashline/                 # Reserved (currently empty)
```

## WHEN TO PUT TESTS HERE

- Test needs separate package metadata or its own lockfile
- Test exercises integration across tool / model boundaries that span multiple `src/` modules
- Test code does not naturally belong next to one source file

## WHEN NOT TO PUT TESTS HERE

- Standard unit / integration tests for a single `src/**` module — co-locate as `*.test.ts`
- Generic Bun-test helpers — those belong in `test-setup.ts` (preloaded via `bunfig.toml`)

## CONVENTIONS

- Bun test runner only (`bun test`)
- No Arrange-Act-Assert comments — keep tests telegraphic
- `mock.module()` users that need lifecycle isolation must import from `module-mock-lifecycle.ts`
- Empty reserved directories (`hashline/`) must not be documented as live modules

## ANTI-PATTERNS

- Reproducing co-located unit tests here just because the directory exists
- Adding generic helpers when `test-setup.ts` is the right place
