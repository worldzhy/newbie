/**
 * All paths are relative to the consuming project root (process.cwd() or
 * the global --cwd option); the CLI itself never assumes it lives inside
 * the project.
 */

export const CONFIG_DIR = ".newbie/.config";
export const CONFIG_JSON = ".newbie/.config/config.json";

export const MODULES_DIR = "src/microservices";
export const MODULES_MODULE_TS = "src/microservices/microservices.module.ts";
export const MODULES_CONFIG_TS = "src/microservices/microservices.config.ts";

export const PRISMA_SCHEMA_MAIN = "prisma/schema.prisma";
export const PRISMA_SCHEMA_MODELS_DIR = "prisma/models";

export const ENV_PATH = ".env";
export const ENV_EXAMPLE_PATH = ".env.example";
export const GIT_MODULES = ".gitmodules";
export const NEST_CLI_JSON = "nest-cli.json";

/** env-tool config: new preferred location first, legacy location as fallback. */
export const ENV_TOOL_CONFIG_CANDIDATES = [
  ".newbie/env.config.json",
  ".newbie-env-tool/.config/config.json",
];
