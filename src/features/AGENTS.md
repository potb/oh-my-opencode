# src/features/ — 18 Feature Modules

**Generated:** 2026-04-11

## OVERVIEW

Standalone feature modules wired into plugin/ layer. Each is self-contained with own types, implementation, and tests.

## MODULE MAP

| Module | Files | Complexity | Purpose |
|--------|-------|------------|---------|
| **opencode-skill-loader** | 33 | HIGH | YAML frontmatter skill loading from multiple scopes |
| **background-agent** | 47 | HIGH | Task lifecycle, concurrency, polling, spawner pattern, circuit breaker |
| **builtin-skills** | 13 | LOW | Built-in skill definitions and templates |
| **claude-code-plugin-loader** | 15 | MEDIUM | Unified plugin discovery from .opencode/plugins/ |
| **claude-tasks** | 7 | MEDIUM | Task schema + file storage + OpenCode todo sync |
| **claude-code-mcp-loader** | 6 | MEDIUM | .mcp.json loading with ${VAR} env expansion |
| **context-injector** | 6 | MEDIUM | AGENTS.md/README.md injection into context |
| **hook-message-injector** | 5 | MEDIUM | System message injection for hooks |
| **task-toast-manager** | 4 | MEDIUM | Task progress notifications |
| **tool-metadata-store** | 3 | LOW | Tool execution metadata cache |
| **claude-code-session-state** | 3 | LOW | Subagent session state tracking |
| **claude-code-command-loader** | 3 | LOW | Load commands from .opencode/commands/ |
| **claude-code-agent-loader** | 3 | LOW | Load agents from .opencode/agents/ |

## KEY MODULES

### background-agent (47 files, ~10k LOC)

Core orchestration engine. `BackgroundManager` manages task lifecycle:
- States: pending → running → completed/error/cancelled/interrupt
- Concurrency: per-model/provider limits via `ConcurrencyManager` (FIFO queue)
- Polling: 3s interval, completion via idle events + stability detection (10s unchanged)
- Circuit breaker: automatic failure detection and recovery
- spawner/: 8 focused files composing via `SpawnerContext` interface

### opencode-skill-loader (33 files, ~3.2k LOC)

4-scope skill discovery (project > opencode > user > global):
- YAML frontmatter parsing from SKILL.md files
- Skill merger with priority deduplication
- Template resolution with variable substitution
- Provider gating for model-specific skills

### builtin-skills (8 skill objects)

| Skill | Size | MCP | Tools |
|-------|------|-----|-------|
| git-master | 1111 LOC | — | Bash |
| agent-browser | (in playwright.ts) | — | Bash(agent-browser:*) |
| frontend-ui-ux | 79 LOC | — | — |
| review-work | ~LOC | --- | --- |

Browser automation uses `agent-browser` only.
