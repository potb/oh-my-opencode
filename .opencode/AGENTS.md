# .opencode/ — Project Runtime Config and Installed Skills

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Project-local OpenCode runtime surface. Owns custom slash-command docs, installed project skills, and the local plugin dependency pin used for project-specific workflows.

## STRUCTURE

```text
.opencode/
├── command/                # project command docs (`*.md`)
├── skills/                 # installed project skills and assets
├── package.json            # local plugin dependency pin
├── bun.lock                # local Bun lockfile
├── package-lock.json       # npm lockfile for local skill/runtime installs
├── background-tasks.json   # local task/runtime state snapshot
└── node_modules/           # installed runtime dependencies; not authored content
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Update project slash commands | `command/*.md` | Command docs consumed by the runtime |
| Update installed project skills | `skills/*/` | Skill assets, scripts, and metadata |
| Adjust local plugin dependency | `package.json` | Keep version pin intentional |
| Inspect runtime task state | `background-tasks.json` | Operational snapshot, not authored policy |

## CONVENTIONS

- Skill directories own their own SKILL.md/assets/scripts; keep each skill self-contained.
- Command docs here are project-specific overlays, not replacements for source-owned runtime behavior.
- `node_modules/` and lockfiles are support assets; do not treat them as documentation targets.
- Keep project-installed skill policy aligned with root repo conventions when there is overlap.

## ANTI-PATTERNS

- Do not edit `node_modules/` to change project behavior.
- Do not duplicate root `AGENTS.md` policy text into every skill/command doc.
- Do not store secrets or one-off local hacks in project skill assets.
