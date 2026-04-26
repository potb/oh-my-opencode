# src/agents/sisyphus-junior/ — Focused Executor Variants

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Sisyphus-Junior is the focused executor invoked via category-based delegation. Performs delegated work directly and never delegates onward.

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | Factory, model routing, blocked-tool policy |
| `default.ts` | Default / Claude prompt |
| `gpt.ts` | GPT family base prompt |
| `gpt-5-4.ts` | GPT-5.4 optimized prompt |
| `gpt-5-3-codex.ts` | GPT-5.3 Codex optimized prompt |
| `gemini.ts` | Gemini optimized prompt |
| `index.ts` | Barrel exports |
| `index.test.ts` | Junior factory + routing tests |

## ROUTING (in `agent.ts`)

- `gpt-5-4*` → `gpt-5-4.ts`
- `gpt-5-3*codex*` → `gpt-5-3-codex.ts`
- other GPT → `gpt.ts`
- `gemini*` → `gemini.ts`
- everything else → `default.ts`

## CONTRACTS

- Mode is always `subagent`
- `task` tool is always blocked (no onward delegation)
- GPT variants additionally block `apply_patch`
- Prompt selection happens via `getSisyphusJuniorPromptSource()` + `buildSisyphusJuniorPrompt()`

## ANTI-PATTERNS

- Letting Junior spawn or route to other agents
- Copy-pasting shared policy into every variant when `agent.ts` already owns the routing contract
- Adding `task` to a variant's allowed tools
