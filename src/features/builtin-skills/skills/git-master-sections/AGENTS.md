# src/features/builtin-skills/skills/git-master-sections/ — Git Master Prompt Sections

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Static prompt-section fragments that make up the Git Master skill. This directory owns the long-form operational guidance for commit, rebase, and history-search modes.

## FILES

| File | Purpose |
|------|---------|
| `overview.ts` | Mode detection and non-negotiable multi-commit rules |
| `commit-workflow.ts` | Style detection, atomic commit planning, execution/verification |
| `rebase-workflow.ts` | Rebase strategies, conflict handling, force-push rules |
| `history-search-workflow.ts` | Pickaxe, regex, blame, bisect, file-history guidance |
| `quick-reference.ts` | Condensed decision tree + anti-pattern checklist |

## CONVENTIONS

- Keep these files as prompt-text owners, not Git implementation code.
- Cross-file rules must stay consistent, especially around commit splitting and history safety.
- Update `quick-reference.ts` when longer workflow files change policy.

## ANTI-PATTERNS

- Divergent rules between `overview.ts` and workflow sections
- Hiding new Git policies only in one workflow file
- Adding runtime helper logic here instead of prompt content
