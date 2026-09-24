/**
 * Pure operations on the project-root `modules.json` install manifest.
 *
 * Shape (Stage 3b registry-copy model):
 * {
 *   "registry": { "url": "...", "sourceCommit": "<sha>" },
 *   "modules": [
 *     { "key": "account", "version": null, "sourceCommit": "<sha>",
 *       "localPatches": [] }
 *   ]
 * }
 *
 * File IO lives in lib/modules-state.ts; this module never touches the disk,
 * which keeps enable/disable planning unit-testable.
 */

export interface ModuleRecord {
  key: string;
  /** Per-module version (changeset/directory tag); null until tags exist. */
  version: string | null;
  /** Registry commit the module files were copied from. */
  sourceCommit: string | null;
  /** Recorded drift (patch-ids); managed by `newbie doctor`. */
  localPatches: string[];
}

export interface ModulesState {
  registry: {
    url?: string;
    ref?: string | null;
    sourceCommit?: string | null;
  } | null;
  modules: ModuleRecord[];
  [key: string]: unknown;
}

export function createEmptyModulesState(): ModulesState {
  return { registry: null, modules: [] };
}

function normalizeRecord(raw: unknown): ModuleRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.key !== "string" || record.key.length === 0) return null;
  const sourceCommit =
    typeof record.sourceCommit === "string" ? record.sourceCommit : null;
  const version =
    typeof record.version === "string" ? record.version : null;
  const localPatches = Array.isArray(record.localPatches)
    ? record.localPatches.filter(
        (patch): patch is string => typeof patch === "string",
      )
    : [];
  return { key: record.key, version, sourceCommit, localPatches };
}

export function normalizeModulesState(raw: unknown): ModulesState {
  const data = (raw && typeof raw === "object"
    ? raw
    : {}) as Partial<ModulesState>;
  const registryData =
    data.registry && typeof data.registry === "object" ? data.registry : null;
  const registry = registryData
    ? {
        url:
          typeof registryData.url === "string" ? registryData.url : undefined,
        ref:
          typeof registryData.ref === "string" ? registryData.ref : null,
        sourceCommit:
          typeof registryData.sourceCommit === "string"
            ? registryData.sourceCommit
            : null,
      }
    : null;

  const records = Array.isArray(data.modules)
    ? data.modules
        .map(normalizeRecord)
        .filter((record): record is ModuleRecord => record !== null)
    : [];

  const seen = new Set<string>();
  const modules: ModuleRecord[] = [];
  for (const record of records) {
    if (seen.has(record.key)) continue;
    seen.add(record.key);
    modules.push(record);
  }

  return { ...(data as object), registry, modules };
}

export function moduleKeys(state: ModulesState): string[] {
  return state.modules.map((record) => record.key);
}

export interface EnabledDiff {
  /** Keys present in `next` but not in `current`. */
  added: string[];
  /** Keys present in `current` but not in `next`. */
  removed: string[];
}

export function diffModuleKeys(current: string[], next: string[]): EnabledDiff {
  const currentSet = new Set(current);
  const nextSet = new Set(next);
  return {
    added: next.filter((key) => !currentSet.has(key)),
    removed: current.filter((key) => !nextSet.has(key)),
  };
}

/**
 * Produce the next state after changing the enabled module list.
 * Existing records of retained modules are preserved (pins/localPatches);
 * new keys get empty records that the assemble step fills with the registry
 * sourceCommit; removed modules drop their records entirely.
 */
export function withModuleKeys(
  state: ModulesState,
  nextKeys: string[],
): ModulesState {
  const byKey = new Map(state.modules.map((record) => [record.key, record]));
  const seen = new Set<string>();
  const modules: ModuleRecord[] = [];
  for (const key of nextKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    modules.push(
      byKey.get(key) ?? {
        key,
        version: null,
        sourceCommit: null,
        localPatches: [],
      },
    );
  }
  return { ...state, modules };
}
