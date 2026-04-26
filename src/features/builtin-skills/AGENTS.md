# src/features/builtin-skills/ — Built-in Skill Definitions

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Owns repo-local built-in skill metadata plus the authored SKILL.md assets that back those skills. This subtree mixes static skill content with TypeScript registration/prompt-builder code, so keep the ownership boundary explicit.

## STRUCTURE

```text
builtin-skills/
├── index.ts              # barrel exports
├── skills.ts             # `createBuiltinSkills()` factory
├── types.ts              # `BuiltinSkill` types
├── skills.test.ts        # registry-focused tests
├── agent-browser/        # authored SKILL.md asset
├── frontend-ui-ux/       # authored SKILL.md asset
├── git-master/           # authored SKILL.md asset + resources
└── skills/               # TypeScript skill registrations and prompt fragments
    ├── agent-browser.ts
    ├── frontend-ui-ux.ts
    ├── git-master.ts
    ├── review-work.ts
    └── git-master-sections/  # git prompt-section fragments
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Register/change builtin skills | `skills.ts`, `types.ts` | Runtime registry boundary |
| Edit authored skill copy | sibling skill dirs with `SKILL.md` | Static prompt assets |
| Change TypeScript skill metadata | `skills/*.ts` | Skill names, descriptions, templates |
| Change git-master long-form policy | `skills/git-master-sections/` | Prompt-section owners, not runtime git code |

## CONVENTIONS

- Keep authored `SKILL.md` assets separate from TypeScript registration code.
- Update both the skill asset and the TS registration when a skill contract changes.
- `git-master-sections/` owns prompt fragments only; runtime git behavior belongs elsewhere.
- Built-in skills remain repo-local definitions; fixed-product runtime does not fetch them from remote sources.

## ANTI-PATTERNS

- Do not hide policy changes in one prompt fragment without updating the owning skill asset.
- Do not mix runtime helper logic into authored skill directories.
- Do not duplicate root repo conventions here unless they materially change skill behavior.
