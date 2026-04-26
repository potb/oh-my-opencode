# src/features/builtin-skills/skills/git-master-sections/ — Git Master Prompt Sections

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Long-form prompt fragments for the `git-master` skill. Owns operational guidance for commit, rebase, and history-search modes. Prompt content only — no runtime git logic.

## FILES

| File | Purpose |
|------|---------|
| `overview.ts` | Mode detection + non-negotiable multi-commit rules |
| `commit-workflow.ts` | Style detection, atomic commit planning, execution + verification |
| `rebase-workflow.ts` | Rebase strategies, conflict handling, force-push safety rules |
| `history-search-workflow.ts` | Pickaxe (`log -S`), regex, blame, bisect, file-history guidance |
| `quick-reference.ts` | Condensed decision tree + anti-pattern checklist |

## CONVENTIONS

- These files own prompt text — never runtime git implementation
- Cross-file rules must stay consistent (commit splitting, history safety)
- Update `quick-reference.ts` whenever a workflow file changes policy

## ANTI-PATTERNS

- Divergent rules between `overview.ts` and a workflow section
- Adding new git policy in only one workflow file
- Adding runtime helper logic here instead of prompt content
