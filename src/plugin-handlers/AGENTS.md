# src/plugin-handlers/ — Fixed-Product Config Pipeline

**Generated:** 2026-04-11

## CRITICAL: AGENT ORDERING

The canonical agent order is **sisyphus**.

This order is enforced via two mechanisms working together:
1. `CANONICAL_CORE_AGENT_ORDER` in `agent-priority-order.ts` controls object key insertion order
2. `agent-key-remapper.ts` injects ZWSP-prefixed runtime names into the `name` field for OpenCode's `localeCompare` sort

### Why Two Mechanisms

OpenCode's `Agent.list()` sorts agents by `name` field via `localeCompare`. Object key order alone is not enough. The `name` field carries a ZWSP prefix for the core agent so it sorts before alphabetically-named agents.

ZWSP is intentionally used in the `name` field only. It MUST NOT appear in:
- Object keys (used as HTTP header values, causes RFC 7230 violations)
- Display names returned by `getAgentDisplayName()`
- Config keys

### History

Agent ordering has caused 15+ commits, 8+ PRs, and multiple reverts due to:
1. Early ZWSP attempts that leaked into HTTP headers via object keys
2. Object.entries() iteration order depending on merge sequence
3. Multiple code paths assembling agents differently

### Forbidden Patterns

DO NOT introduce:
- ZWSP in object keys or display names (only allowed in `name` field via `getAgentRuntimeName()`)
- Runtime sort shims or comparators
- Alternative ordering constants
- Object.entries() order dependencies

PRs attempting these patterns will be rejected.

## OVERVIEW

Config-handler files implement the fixed-product `config` hook. The runtime applies provider state, builtin agents, tool permissions, and clears removed command/MCP surfaces.

## ACTIVE PIPELINE

| Step | Handler | Purpose |
|------|---------|---------|
| 1 | `applyProviderConfig` | Cache model context limits, detect anthropic-beta headers |
| 2 | `applyAgentConfig` | Build the builtin fixed-product agent surface |
| 3 | `applyToolConfig` | Agent-specific tool permissions |
| 4 | `config.command = {}; config.mcp = {};` | Clear removed command and MCP loading surfaces |

## FILES

| File | Lines | Purpose |
|------|-------|---------|
| `config-handler.ts` | ~200 | Main orchestrator for fixed-product config wiring |
| `plugin-components-loader.ts` | ~100 | CC plugin discovery (10s timeout) |
| `agent-config-handler.ts` | ~300 | Builtin agent loading and ordering |
| `tool-config-handler.ts` | ~100 | Agent-specific tool grants/denials |
| `provider-config-handler.ts` | ~80 | Provider config + model cache |
| `plan-model-inheritance.ts` | 28 | Plan demotion logic |
| `agent-priority-order.ts` | ~30 | sisyphus first |
| `agent-key-remapper.ts` | ~30 | Agent key → display name |
| `category-config-resolver.ts` | ~40 | User vs default category lookup |
| `index.ts` | ~10 | Barrel exports |

## TOOL PERMISSIONS

| Agent | Granted | Denied |
|-------|---------|--------|
| Librarian | grep_app_* | — |
| Sisyphus | task, task_*, teammate | — |
| Default (all others) | — | grep_app_*, task_*, teammate, LSP |

## MULTI-LEVEL CONFIG MERGE

```
User (~/.config/opencode/oh-my-openagent.jsonc)
  ↓ deepMerge
Project (.opencode/oh-my-openagent.jsonc)
  ↓ Zod defaults
Final Config
```

- `agents`, `categories`, `claude_code`: deep merged
- `disabled_*` arrays: Set union
