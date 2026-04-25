# src/agents/sisyphus-junior/ — Focused Executor Variants

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Prompt variants and factory logic for Sisyphus-Junior, the focused executor that performs delegated work directly and never delegates onward.

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | Factory, model routing, blocked-tool policy |
| `default.ts` | Default/Claude-oriented prompt |
| `gpt.ts` | GPT-oriented prompt |
| `gpt-5-4.ts` | GPT-5.4-optimized prompt |
| `gpt-5-3-codex.ts` | GPT-5.3 Codex-optimized prompt |
| `gemini.ts` | Gemini-oriented prompt |
| `index.ts` | Exports |

## ROUTING

- GPT family → `gpt.ts` / `gpt-5-4.ts` / `gpt-5-3-codex.ts`
- Gemini family → `gemini.ts`
- Everything else → `default.ts`

## CONTRACTS

- Mode is `subagent`
- `task` is always blocked
- GPT variants also block `apply_patch`
- Prompt selection happens in `getSisyphusJuniorPromptSource()` and `buildSisyphusJuniorPrompt()`

## WHERE TO LOOK

- Change executor description/model defaults: `agent.ts`
- Change model-specific prompt guidance: corresponding variant file
- Change tool restriction policy: `BLOCKED_TOOLS`, `GPT_BLOCKED_TOOLS`

## ANTI-PATTERNS

- Letting Junior spawn/route other agents
- Copy-pasting shared policy into every variant when `agent.ts` can own the routing contract
