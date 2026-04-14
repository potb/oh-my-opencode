# src/config/ — Zod v4 Schema System

**Generated:** 2026-04-11

## OVERVIEW

Schema files composing `OhMyOpenCodeConfigSchema`. Zod v4 validation with `safeParse()`. All fields optional — omitted fields use plugin defaults.

## SCHEMA TREE

```
config/schema/
├── oh-my-opencode-config.ts    # ROOT: OhMyOpenCodeConfigSchema (composes all below)
├── agent-names.ts              # BuiltinAgentNameSchema, OverridableAgentNameSchema
├── agent-overrides.ts          # AgentOverrideConfigSchema (21 fields per agent)
├── categories.ts               # Built-in + custom categories
├── hooks.ts                    # HookNameSchema (48 hooks)
├── experimental.ts             # Feature flags (plugin_load_timeout_ms min 1000)
├── sisyphus.ts                 # SisyphusConfigSchema (task system)
├── tmux.ts                     # Legacy tmux schema module (no longer part of root config)
├── websearch.ts                # provider: "exa" | "tavily"
├── claude-code.ts              # CC compatibility settings
├── comment-checker.ts          # AI comment detection config
├── git-master.ts               # commit_footer: boolean | string
├── browser-automation.ts       # provider: playwright | agent-browser | playwright-cli
├── background-task.ts          # Concurrency limits per model/provider
├── fallback-models.ts          # FallbackModelsConfigSchema
├── dynamic-context-pruning.ts  # Context pruning settings
├── openclaw.ts                # OpenClaw integration settings
├── git-env-prefix.ts          # Git environment prefix config
└── internal/permission.ts      # AgentPermissionSchema

```

## ROOT SCHEMA FIELDS

`$schema`, `new_task_system_enabled`, `default_run_agent`, `disabled_mcps`, `disabled_agents`, `disabled_hooks`, `disabled_commands`, `disabled_tools`, `hashline_edit`, `agents`, `categories`, `claude_code`, `comment_checker`, `experimental`, `background_task`, `git_master`, `browser_automation_engine`, `websearch`, `sisyphus`, `_migrations`

## AGENT OVERRIDE FIELDS

`model`, `variant`, `category`, `skills`, `temperature`, `top_p`, `prompt`, `prompt_append`, `tools`, `disable`, `description`, `mode`, `color`, `permission`, `maxTokens`, `thinking`, `reasoningEffort`, `textVerbosity`, `providerOptions`

## HOW TO ADD CONFIG

1. Create `src/config/schema/{name}.ts` with Zod schema
2. Add field to `oh-my-opencode-config.ts` root schema
3. Reference via `z.infer<typeof YourSchema>` for TypeScript types
4. Access in handlers via `pluginConfig.{name}`
