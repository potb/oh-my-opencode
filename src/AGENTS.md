# src/ — Plugin Source

**Generated:** 2026-04-11

## OVERVIEW

Entry point `index.ts` orchestrates 5-step initialization: loadConfig → createManagers → createTools → createHooks → createPluginInterface.

## KEY FILES

| File | Purpose |
|------|---------|
| `index.ts` | Plugin entry, exports `OhMyOpenCodePlugin` |
| `plugin-config.ts` | JSONC parse, multi-level merge, Zod v4 validation |
| `create-managers.ts` | BackgroundManager and config/runtime managers |
| `create-tools.ts` | ToolRegistry wiring |
| `create-hooks.ts` | Core + continuation hook composition |
| `plugin-interface.ts` | 10 OpenCode hook handlers: config, tool, chat.message, chat.params, chat.headers, event, tool.execute.before, tool.execute.after, experimental.chat.messages.transform, experimental.session.compacting |

## CONFIG LOADING

```
loadPluginConfig(directory, ctx)
  1. User: ~/.config/opencode/oh-my-openagent.jsonc
  2. Project: .opencode/oh-my-openagent.jsonc
  3. mergeConfigs(user, project) → deepMerge for agents/categories, Set union for disabled_*
  4. Zod safeParse → defaults for omitted fields
  5. migrateConfigFile() → legacy key transformation
```

## HOOK COMPOSITION

```
createHooks()
  ├─→ createCoreHooks()           # Session + guard + transform hooks
  │   ├─ createSessionHooks()     # Session-facing runtime hooks
  │   ├─ createToolGuardHooks()   # Tool guard hooks: writeExistingFileGuard, jsonErrorRecovery, hashlineReadEnhancer, bashFileReadGuard, readImageResizer, todoDescriptionOverride, webfetchRedirectGuard...
  │   └─ createTransformHooks()   # 2: thinkingBlockValidator, toolPairValidator
  └─→ createContinuationHooks()   # Continuation hooks
```
