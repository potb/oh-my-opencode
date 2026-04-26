# src/agents/sisyphus/ — Orchestrator Prompt Variants

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Model-specific prompt variants for the main Sisyphus orchestrator. Parent `../sisyphus.ts` picks the variant based on the active model.

## FILES

| File | Purpose |
|------|---------|
| `default.ts` | Base / Claude / Kimi / GLM prompt — full task management + delegation guides |
| `gemini.ts` | Gemini-tuned prompt — stricter tool-usage rules, NEVER blocks |
| `gpt-5-4.ts` | GPT-5.4-native prompt — entropy-reduced 8-block architecture |

(No `index.ts` here. Parent `sisyphus.ts` imports each variant directly.)

## VARIANT SELECTION

Implemented in `../sisyphus.ts`:
- model contains `gemini` → `gemini.ts`
- model contains `gpt-5.4` / `gpt-5-4` → `gpt-5-4.ts`
- everything else (Claude, Kimi, GLM, etc.) → `default.ts`

## CONTRACTS

- Each variant exports a prompt builder used by `sisyphus.ts`
- Each variant must keep core orchestrator behavior (planning, delegation, verification)
- Variant files own model-specific tone and tool-usage shape only

## ANTI-PATTERNS

- Diverging core delegation policy across variants
- Adding routing logic here — variant selection lives in parent `sisyphus.ts`
