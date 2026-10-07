import fs from "node:fs/promises";
import path from "node:path";

/**
 * Runtime module snapshot reader for the module-hub reporter.
 *
 * The CLI's `newbie status --json` is the canonical source for the module
 * inventory shape, but the running process cannot invoke the CLI. This module
 * replicates the subset of that logic that is derivable from disk alone:
 *   - reads the project-root `modules.json` install manifest
 *   - checks whether each module directory exists under `src/modules/`
 *   - reads each installed module's `newbie.module.json` to detect a Prisma
 *     schema fragment
 *
 * Fields that require CLI-only capabilities (registry comparison for
 * `updateAvailable`, env validation for `missingEnv`, pristine diff for
 * `drift`) are intentionally omitted — the hub stores the snapshot verbatim
 * and the host can recompute them if needed.
 */

/** Project-root install manifest filename (same as CLI constants). */
const MODULES_JSON = "modules.json";
/** Directory where assembled modules live in a consuming project. */
const MODULES_DIR = "src/modules";
/** Per-module manifest filename. */
const MODULE_MANIFEST_FILE = "newbie.module.json";

/**
 * One entry in the module snapshot, matching the shape of
 * `newbie status --json` modules[] (subset — see file docstring).
 */
export interface ModuleSnapshotEntry {
  key: string;
  version: string | null;
  sourceCommit: string | null;
  localPatches: string[];
  installed: boolean;
  hasSchema: boolean;
}

interface RawModuleRecord {
  key?: unknown;
  version?: unknown;
  sourceCommit?: unknown;
  localPatches?: unknown;
}

interface RawModulesJson {
  modules?: unknown;
}

/**
 * Read the project's `modules.json` and produce a snapshot array in the same
 * shape as `newbie status --json` modules[] entries.
 *
 * Returns an empty array when `modules.json` is absent or unparseable — the
 * caller (reporter) still sends a `kind="full"` report, just without a module
 * list. This keeps the self-registration path resilient: a project that hasn't
 * been assembled via the CLI can still register its installation.
 */
export async function readModuleSnapshot(projectRoot: string): Promise<ModuleSnapshotEntry[]> {
  const target = path.resolve(projectRoot, MODULES_JSON);
  let content: string;
  try {
    content = await fs.readFile(target, "utf8");
  } catch {
    return [];
  }

  let raw: RawModulesJson;
  try {
    raw = JSON.parse(content) as RawModulesJson;
  } catch {
    return [];
  }

  const records = Array.isArray(raw.modules) ? (raw.modules as RawModuleRecord[]) : [];
  const entries: ModuleSnapshotEntry[] = [];

  for (const record of records) {
    if (!record || typeof record.key !== "string" || record.key.length === 0) continue;

    const moduleDir = path.resolve(projectRoot, MODULES_DIR, record.key);
    let installed = false;
    let hasSchema = false;

    try {
      await fs.stat(moduleDir);
      installed = true;
    } catch {
      installed = false;
    }

    if (installed) {
      try {
        const manifestRaw = await fs.readFile(path.join(moduleDir, MODULE_MANIFEST_FILE), "utf8");
        const manifest = JSON.parse(manifestRaw) as { schema?: unknown };
        hasSchema = typeof manifest.schema === "string";
      } catch {
        hasSchema = false;
      }
    }

    entries.push({
      key: record.key,
      version: typeof record.version === "string" ? record.version : null,
      sourceCommit: typeof record.sourceCommit === "string" ? record.sourceCommit : null,
      localPatches: Array.isArray(record.localPatches)
        ? record.localPatches.filter((p): p is string => typeof p === "string")
        : [],
      installed,
      hasSchema,
    });
  }

  return entries;
}
