# src/shared/ — 100+ Utility Files

**Generated:** 2026-04-11

## OVERVIEW

Cross-cutting utilities used throughout the plugin. Barrel-exported from `index.ts`. Logger writes to `/tmp/oh-my-opencode.log`.

## CATEGORY MAP

| Category | Files | Key Exports |
|----------|-------|-------------|
| **Model Resolution** | ~18 | `resolveModelPipeline()`, `checkModelAvailability()` |
| **Tmux Integration** | 11 | `createTmuxSession()`, `spawnPane()`, `closePane()`, server health |
| **Configuration & Paths** | 5 | `resolveOpenCodeConfigDir()`, `getDataPath()` |
| **Session Management** | 8 | `SessionCursor`, `trackInjectedPath()`, `SessionToolsStore` |
| **Git Worktree** | 7 | `parseGitStatusPorcelain()`, `collectGitDiffStats()`, `formatFileChanges()` |
| **Command Execution** | 7 | `executeCommand()`, `executeHookCommand()`, embedded command registry |
| **String & Tool Utils** | 6 | `toSnakeCase()`, `normalizeToolName()`, `parseFrontmatter()` |
| **Agent Configuration** | 5 | `getAgentVariant()`, `AGENT_DISPLAY_NAMES`, `AGENT_TOOL_RESTRICTIONS` |
| **OpenCode Integration** | 4 | `injectServerAuth()`, client accessors |
| **Type Helpers** | 4 | `deepMerge()`, `DynamicTruncator`, `matchPattern()`, `isRecord()` |
| **Misc** | 8 | `log()`, `readFile()`, `extractZip()`, `downloadBinary()`, `findAvailablePort()` |

## MODEL RESOLUTION

Current resolution in this subtree is intentionally narrower than older revisions:
- explicit override model when configured
- category/default model matching against currently available models
- no legacy fallback-chain compatibility logic

Key files: `model-resolution-pipeline.ts` (orchestration), `model-availability.ts` (fuzzy matching), `model-normalization.ts` (normalization).

## MOST IMPORTED

| Utility | Import Count | Purpose |
|---------|-------------|---------|
| `logger.ts` | 62 | `/tmp/oh-my-opencode.log` |
| `data-path.ts` | 11 | XDG storage resolution |
| `system-directive.ts` | 11 | System message filtering |
| `frontmatter.ts` | 10 | YAML metadata extraction |
