# src/features/ — Feature Modules

**Generated:** 2026-04-11

## OVERVIEW

Standalone feature modules wired into plugin/ layer. Each is self-contained with own types, implementation, and tests.

## MODULE MAP

| Module | Files | Complexity | Purpose |
|--------|-------|------------|---------|
| **background-agent** | 47 | HIGH | Task lifecycle, concurrency, polling, spawner pattern, circuit breaker |
| **builtin-skills** | 13 | LOW | Built-in skill definitions and templates |
| **claude-code-plugin-loader** | 15 | MEDIUM | Unified plugin discovery from .opencode/plugins/ |
| **claude-code-mcp-loader** | 6 | MEDIUM | .mcp.json loading with ${VAR} env expansion |

## KEY MODULES

### background-agent (47 files, ~10k LOC)

Core orchestration engine. `BackgroundManager` manages task lifecycle:
- States: pending → running → completed/error/cancelled/interrupt
- Concurrency: per-model/provider limits via `ConcurrencyManager` (FIFO queue)
- Polling: 3s interval, completion via idle events + stability detection (10s unchanged)
- Circuit breaker: automatic failure detection and recovery
- spawner/: 8 focused files composing via `SpawnerContext` interface

### builtin-skills (4 skill objects)

| Skill | Size | MCP | Tools |
|-------|------|-----|-------|
| git-master | 1111 LOC | — | Bash |
| agent-browser | (in agent-browser.ts) | — | Bash(agent-browser:*) |
| frontend-ui-ux | 79 LOC | — | — |
| review-work | ~LOC | --- | --- |

Browser automation uses `agent-browser` only.
