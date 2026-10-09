/**
 * Pure parsing/normalisation of `newbie.module.json`, the per-module manifest
 * that replaced the legacy `.newbie/<key>.settings.json` bundle.
 *
 * The manifest lives at the root of every module directory, both inside the
 * newbie-modules registry and in the consuming project (`src/modules/<key>`).
 */

import { NestAsset } from "./assets";

/**
 * Cross-deployment topological role of a module.
 *
 * Absent for ordinary modules whose capabilities serve the host application
 * itself. "observer" modules additionally expose token-only ingestion
 * endpoints for remote deployments and model those remote endpoints as
 * installations (heartbeat / backend-monitor / web-monitor / module-hub):
 * the other half of the protocol lives in a separately distributed SDK or
 * CLI. This axis is orthogonal to `layer`, which constrains in-process
 * dependency direction.
 */
export type ModuleRole = "observer";

export const MODULE_ROLES: readonly ModuleRole[] = ["observer"];

export function isModuleRole(value: string): value is ModuleRole {
  return (MODULE_ROLES as readonly string[]).includes(value);
}

export interface ModuleWiring {
  /** Module file without extension, e.g. "account.module". */
  file: string;
  /** Exported NestJS module class name, e.g. "AccountModule". */
  className: string;
}

export interface ModuleManifest {
  key: string;
  /** Architectural layer of the module; absent for framework-special modules. */
  layer?: string;
  /**
   * Cross-deployment topological role; absent for ordinary modules that only
   * serve the host application. Only declared values are permitted.
   */
  role?: ModuleRole;
  module: ModuleWiring;
  /** Project-relative path of the Prisma model fragment; absent = no models. */
  schema?: string;
  "config-service"?: Record<string, unknown>;
  env?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  /**
   * Registry module keys this module imports via `@modules/<key>`. The CLI
   * expands enabled modules to the transitive closure of these declarations
   * when planning installs, so a required module can never be left behind.
   */
  moduleDependencies?: string[];
  assets?: NestAsset[];
  /**
   * CLI namespace this module exposes. When declared, the CLI dynamically
   * loads `<modulesDir>/<key>/cli/index.ts` at startup and registers the
   * exported `register(program)` hook under this namespace.
   */
  cli?: string;
  /**
   * Package name of the companion SDK that ships with this module. The
   * version is declared in the consumer project's `dependencies` (or the
   * module's own `dependencies` field); this attribute only records the
   * pairing so tooling can locate the SDK without scanning package names.
   */
  sdk?: string;
  [key: string]: unknown;
}

/** Validate and normalise the optional `moduleDependencies` manifest field. */
function normalizeModuleDependencies(raw: unknown, key: string): string[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || !raw.every((item) => typeof item === "string" && item.trim().length > 0)) {
    throw new Error(
      `Invalid newbie.module.json for '${key}': moduleDependencies must be an array of non-empty strings.`,
    );
  }
  return [...new Set(raw.map((item) => (item as string).trim()))];
}

/**
 * Validate that an optional manifest field is either absent or a non-empty
 * string. Used for fields like `cli` and `sdk` whose presence triggers runtime
 * behaviour (dynamic CLI loading, SDK pairing), so a malformed value must fail
 * loudly instead of silently being dropped.
 */
function assertOptionalString(value: unknown, field: string, key: string): void {
  if (value === undefined) return;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid newbie.module.json for '${key}': '${field}' must be a non-empty string when declared.`);
  }
}

/** Validate that the optional `role` field, when declared, is a known role. */
function assertOptionalRole(value: unknown, key: string): void {
  if (value === undefined) return;
  if (typeof value !== "string" || !isModuleRole(value)) {
    throw new Error(
      `Invalid newbie.module.json for '${key}': 'role' must be one of: ${MODULE_ROLES.join(", ")} when declared.`,
    );
  }
}

export function normalizeModuleManifest(raw: unknown, expectedKey?: string): ModuleManifest {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid newbie.module.json: expected an object.");
  }
  const data = raw as Record<string, unknown>;

  if (typeof data.key !== "string" || data.key.length === 0) {
    throw new Error("Invalid newbie.module.json: string 'key' is required.");
  }
  if (expectedKey && data.key !== expectedKey) {
    throw new Error(`Invalid newbie.module.json: key '${data.key}' does not match directory '${expectedKey}'.`);
  }

  const wiring = data.module as Partial<ModuleWiring> | undefined;
  if (
    !wiring ||
    typeof wiring.file !== "string" ||
    typeof wiring.className !== "string" ||
    wiring.file.length === 0 ||
    wiring.className.length === 0
  ) {
    throw new Error(
      `Invalid newbie.module.json for '${data.key}': module.file and module.className strings are required.`,
    );
  }

  const moduleDependencies = normalizeModuleDependencies(data.moduleDependencies, data.key);
  assertOptionalString(data.cli, "cli", data.key);
  assertOptionalString(data.sdk, "sdk", data.key);
  assertOptionalRole(data.role, data.key);
  const manifest: ModuleManifest = {
    ...(data as object),
    key: data.key,
    module: { file: wiring.file, className: wiring.className },
  };
  if (typeof data.schema !== "string") delete manifest.schema;
  if (moduleDependencies) {
    manifest.moduleDependencies = moduleDependencies;
  } else {
    delete manifest.moduleDependencies;
  }
  return manifest;
}

/** Import statement emitted into the generated modules.module.ts. */
export function moduleImportLine(key: string, manifest: ModuleManifest): string {
  return `import {${manifest.module.className}} from './${key}/${manifest.module.file}';`;
}

/** Validate/sanitise user-supplied module keys against a known key set. */
export function sanitizeModuleNames(names: string[], knownKeys: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names.map((name) => name.trim())) {
    if (!knownKeys.has(name) || seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }
  return result;
}
