/**
 * All paths are relative to the consuming project root (process.cwd() or
 * the global --cwd option); the CLI itself never assumes it lives inside
 * the project.
 */

/** Project-root install manifest (shadcn components.json style). */
export const MODULES_JSON = "modules.json";

export const MODULES_DIR = "src/modules";
export const MODULES_MODULE_TS = "src/modules/modules.module.ts";
export const MODULES_CONFIG_TS = "src/modules/modules.config.ts";

/** Manifest every module directory carries inside the registry / project. */
export const MODULE_MANIFEST_FILE = "newbie.module.json";

export const PRISMA_SCHEMA_MAIN = "prisma/schema.prisma";
export const PRISMA_SCHEMA_MODELS_DIR = "prisma/models";

export const ENV_PATH = ".env";
export const ENV_EXAMPLE_PATH = ".env.example";
export const NEST_CLI_JSON = "nest-cli.json";
export const PACKAGE_JSON_PATH = "package.json";

/** Generated module-layer compose file (ADR-008 D1), rendered by assemble. */
export const DEPLOY_COMPOSE_MODULES = "deploy/compose.modules.yml";
/** Caddy template carrying the @@newbie-modules route block (ADR-008 D4). */
export const DEPLOY_CADDYFILE_TMPL = "deploy/Caddyfile.tmpl";

/** Layout of the newbie-modules registry monorepo. */
export const REGISTRY_MODULES_DIR = "packages/modules";

/** env-tool config: new preferred location first, legacy location as fallback. */
export const ENV_TOOL_CONFIG_CANDIDATES = [".newbie/env.config.json", ".newbie-env-tool/.config/config.json"];
