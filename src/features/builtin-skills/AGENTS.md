# src/features/builtin-skills/ — Built-in Skill Definitions

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Repo-local built-in skill registrations plus the authored SKILL.md assets that back them. Mixes static skill content with TypeScript registration code; keep the ownership boundary explicit.

## STRUCTURE

```text
builtin-skills/
├── index.ts                 # Barrel exports
├── skills.ts                # `createBuiltinSkills()` factory (registry boundary)
├── skills.test.ts           # Registry-focused tests
├── types.ts                 # `BuiltinSkill` types
├── agent-browser/           # Authored SKILL.md asset
├── frontend-ui-ux/          # Authored SKILL.md asset
├── git-master/              # Authored SKILL.md asset + resources
└── skills/
    ├── agent-browser.ts        # Skill metadata + template
    ├── frontend-ui-ux.ts
    ├── git-master.ts
    ├── git-master-skill-metadata.ts
    ├── review-work.ts
    ├── git-master-sections/    # Long-form prompt fragments
    └── index.ts                # Barrel
```

## SKILLS

`agent-browser`, `frontend-ui-ux`, `git-master`, `review-work`.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Register / change a built-in skill | `skills.ts`, `types.ts` |
| Edit authored skill copy (markdown) | sibling `<skill-name>/SKILL.md` |
| Edit TS metadata (name, description, template) | `skills/<skill-name>.ts` |
| Edit git-master long-form policy | `skills/git-master-sections/` |

## CONVENTIONS

- Keep authored `SKILL.md` separate from TS registration code
- Update both the SKILL.md asset AND the `skills/<name>.ts` file when a skill contract changes
- Built-in skills are repo-local; fixed-product runtime never fetches them remotely

## ANTI-PATTERNS

- Hiding policy in one prompt fragment without updating the owning SKILL.md
- Mixing runtime helper logic into authored skill directories
- Duplicating root repo conventions here unless they materially change skill behavior
