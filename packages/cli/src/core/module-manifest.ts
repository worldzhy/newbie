/**
 * Pure parsing/normalisation of `newbie.module.json`, the per-module manifest
 * that replaced the legacy `.newbie/<key>.settings.json` bundle.
 *
 * The manifest lives at the root of every module directory, both inside the
 * newbie-modules registry and in the consuming project (`src/modules/<key>`).
 */

import { NestAsset } from "./assets";

export interface ModuleWiring {
  /** Module file without extension, e.g. "account.module". */
  file: string;
  /** Exported NestJS module class name, e.g. "AccountModule". */
  className: string;
}

export interface ModuleManifest {
  key: string;
  module: ModuleWiring;
  /** Project-relative path of the Prisma model fragment; absent = no models. */
  schema?: string;
  "config-service"?: Record<string, unknown>;
  env?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  assets?: NestAsset[];
  [key: string]: unknown;
}

export function normalizeModuleManifest(
  raw: unknown,
  expectedKey?: string,
): ModuleManifest {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid newbie.module.json: expected an object.");
  }
  const data = raw as Record<string, unknown>;

  if (typeof data.key !== "string" || data.key.length === 0) {
    throw new Error("Invalid newbie.module.json: string 'key' is required.");
  }
  if (expectedKey && data.key !== expectedKey) {
    throw new Error(
      `Invalid newbie.module.json: key '${data.key}' does not match directory '${expectedKey}'.`,
    );
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

  const manifest: ModuleManifest = {
    ...(data as object),
    key: data.key,
    module: { file: wiring.file, className: wiring.className },
  };
  if (typeof data.schema !== "string") delete manifest.schema;
  return manifest;
}

/** Import statement emitted into the generated modules.module.ts. */
export function moduleImportLine(
  key: string,
  manifest: ModuleManifest,
): string {
  return `import {${manifest.module.className}} from './${key}/${manifest.module.file}';`;
}

/** Validate/sanitise user-supplied module keys against a known key set. */
export function sanitizeModuleNames(
  names: string[],
  knownKeys: ReadonlySet<string>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names.map((name) => name.trim())) {
    if (!knownKeys.has(name) || seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }
  return result;
}
