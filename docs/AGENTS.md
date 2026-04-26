# docs/ — Authored Product Documentation

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Human-facing docs only. This tree owns authored product guidance, examples, troubleshooting, and legal/reference material; it is not a source-of-truth for runtime behavior when `src/**` says otherwise.

## STRUCTURE

```text
docs/
├── examples/         # concrete usage snippets and sample flows
├── guide/            # task-oriented product guidance
├── legal/            # licensing and policy docs
├── reference/        # command/tool reference material
├── superpowers/      # feature spotlights and high-level capability docs
└── troubleshooting/  # failure modes, fixes, operator guidance
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add a user guide | `guide/` | Task-oriented walkthroughs |
| Add examples | `examples/` | Keep copy runnable and concrete |
| Update command/reference docs | `reference/` | Sync with actual source behavior |
| Document failure recovery | `troubleshooting/` | Operator-facing issues only |
| Update licensing/policy text | `legal/` | Coordinate with repo root metadata |

## CONVENTIONS

- Treat `src/**` and root `AGENTS.md` as the runtime truth; docs explain behavior, they do not define it.
- Keep docs telegraphic and operator-useful; avoid marketing filler.
- When source structure or commands change, update the relevant docs and root `AGENTS.md` together.
- Prefer linking to the owning code/domain docs over re-explaining low-level implementation details here.

## ANTI-PATTERNS

- Do not document generated `dist/` behavior as if it were authored source.
- Do not duplicate large blocks of source-owned policy text into docs.
- Do not let examples drift from actual Bun commands or current tool names.
