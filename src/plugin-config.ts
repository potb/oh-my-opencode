import * as fs from "fs";
import * as path from "path";
import { OhMyOpenCodeConfigSchema, type OhMyOpenCodeConfig } from "./config";
import { GitMasterConfigSchema } from "./config/schema/git-master";
import {
  log,
  deepMerge,
  getOpenCodeConfigDir,
  addConfigLoadError,
  parseJsonc,
  detectPluginConfigFile,
} from "./shared";
import { CONFIG_BASENAME } from "./shared/plugin-identity";

function loadExplicitGitMasterOverrides(configPath: string): Record<string, unknown> | undefined {
  if (!fs.existsSync(configPath)) {
    return undefined
  }

  const content = fs.readFileSync(configPath, "utf-8")
  const rawConfig = parseJsonc<Record<string, unknown>>(content)
  if (!("git_master" in rawConfig)) {
    return undefined
  }

  const rawGitMaster = rawConfig.git_master
  const result = GitMasterConfigSchema.safeParse(rawGitMaster)
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")
    throw new Error(`Invalid git_master config at ${configPath}: ${errorMsg}`)
  }

  const explicitKeys = typeof rawGitMaster === "object" && rawGitMaster !== null
    ? Object.keys(rawGitMaster as Record<string, unknown>)
    : []

  return Object.fromEntries(
    Object.entries(result.data).filter(([key]) => explicitKeys.includes(key))
  )
}

function loadConfigFromPath(
  configPath: string,
  _ctx: unknown
): OhMyOpenCodeConfig | null {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const rawConfig = parseJsonc<Record<string, unknown>>(content);

      const result = OhMyOpenCodeConfigSchema.safeParse(rawConfig);

      if (result.success) {
        log(`Config loaded from ${configPath}`, { agents: result.data.agents });
        return result.data;
      }

      const errorMsg = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      log(`Config validation error in ${configPath}:`, result.error.issues);
      addConfigLoadError({
        path: configPath,
        error: errorMsg,
      });
      throw new Error(`Invalid config at ${configPath}: ${errorMsg}`)
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log(`Error loading config from ${configPath}:`, err);
    addConfigLoadError({ path: configPath, error: errorMsg });
    throw err instanceof Error ? err : new Error(errorMsg)
  }
  return null;
}

function mergeConfigs(
  base: OhMyOpenCodeConfig,
  override: OhMyOpenCodeConfig
): OhMyOpenCodeConfig {
  return {
    ...base,
    ...override,
    agents: deepMerge(base.agents, override.agents),
    categories: deepMerge(base.categories, override.categories),
    disabled_agents: [
      ...new Set([
        ...(base.disabled_agents ?? []),
        ...(override.disabled_agents ?? []),
      ]),
    ],
    disabled_hooks: [
      ...new Set([
        ...(base.disabled_hooks ?? []),
        ...(override.disabled_hooks ?? []),
      ]),
    ],
    disabled_tools: [
      ...new Set([
        ...(base.disabled_tools ?? []),
        ...(override.disabled_tools ?? []),
      ]),
    ],
    git_master: deepMerge(base.git_master, override.git_master),
  };
}

export function loadPluginConfig(
  directory: string,
  ctx: unknown
): OhMyOpenCodeConfig {
  // User-level config path - prefer .jsonc over .json
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  const userDetected = detectPluginConfigFile(configDir);
  const userConfigPath =
    userDetected.format !== "none"
      ? userDetected.path
      : path.join(configDir, `${CONFIG_BASENAME}.jsonc`);

  // Project-level config path - prefer .jsonc over .json
  const projectBasePath = path.join(directory, ".opencode");
  const projectDetected = detectPluginConfigFile(projectBasePath);
  const projectConfigPath =
    projectDetected.format !== "none"
      ? projectDetected.path
      : path.join(projectBasePath, `${CONFIG_BASENAME}.jsonc`);

  // Load user config first (base). Parse empty config through Zod to apply field defaults.
  const userConfig = loadConfigFromPath(userConfigPath, ctx)
  const userGitMasterOverrides = loadExplicitGitMasterOverrides(userConfigPath)
  let config: OhMyOpenCodeConfig =
    userConfig ?? OhMyOpenCodeConfigSchema.parse({});

  // Override with project config
  const defaultGitMaster = OhMyOpenCodeConfigSchema.parse({}).git_master
  const projectConfig = loadConfigFromPath(projectConfigPath, ctx);
  const projectGitMasterOverrides = loadExplicitGitMasterOverrides(projectConfigPath)
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }

  if (userGitMasterOverrides || projectGitMasterOverrides) {
    config = {
      ...config,
      git_master: {
        ...defaultGitMaster,
        ...(userGitMasterOverrides ?? {}),
        ...(projectGitMasterOverrides ?? {}),
      },
    }
  }

  log("Final merged config", {
    agents: config.agents,
    disabled_agents: config.disabled_agents,
    disabled_hooks: config.disabled_hooks,
  });
  return config;
}
