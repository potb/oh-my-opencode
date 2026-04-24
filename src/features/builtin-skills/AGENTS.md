# src/features/builtin-skills/ -- 4 Built-in Skills

**Generated:** 2026-04-11

## OVERVIEW

13 files. 4 built-in skills registered via `createBuiltinSkills()`. Each skill implements `BuiltinSkill` with name, description, template, and optional metadata.

## STRUCTURE

```
builtin-skills/
├── index.ts              # Barrel exports
├── skills.ts             # createBuiltinSkills() factory
├── types.ts              # BuiltinSkill interface
├── git-master/           # SKILL.md + resources
├── frontend-ui-ux/       # SKILL.md
├── agent-browser/        # SKILL.md
└── skills/               # Skill implementations as .ts files
    ├── git-master-sections/  # Git master prompt sections
    ├── agent-browser.ts      # agent-browser skill
    ├── frontend-ui-ux.ts     # Frontend UI/UX skill
    ├── git-master.ts         # Git workflow skill
    └── review-work.ts        # Review orchestration skill
```

## SKILL CATALOG

| Skill | LOC | MCP | Purpose |
|-------|-----|-----|---------|
| **git-master** | 1111 | -- | Atomic commits, rebase, history search |
| **agent-browser** | (in agent-browser.ts) | -- | Browser via agent-browser tool |
| **frontend-ui-ux** | 79 | -- | Design-first UI development |
| **review-work** | ~500 | -- | 5-agent post-implementation review |

## BROWSER AUTOMATION

Config `browser_automation_engine` uses `"agent-browser"`.

## FIXED-PRODUCT USAGE

Built-in skills remain repo-local definitions used for prompt metadata and static guidance. The fixed-product runtime does not load external skill files.
