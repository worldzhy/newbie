/**
 * Pure operations on the `.newbie/.config/config.json` project state.
 * File IO lives in lib/project-config.ts; this module never touches the disk,
 * which keeps enable/disable planning unit-testable.
 */

export interface ProjectConfig {
  enabled: string[];
  applicationMode?: string | null;
  developerMode?: string | null;
  /** Global fallback release ref (tag, commit or branch). */
  releaseRef?: string;
  /** Per-module pinned refs (preferred key, legacy name tolerated). */
  microserviceReleaseRefs?: Record<string, string>;
  releaseRefs?: Record<string, string>;
  [key: string]: unknown;
}

export function createEmptyProjectConfig(): ProjectConfig {
  return { enabled: [] };
}

export function normalizeProjectConfig(raw: unknown): ProjectConfig {
  const config = (
    raw && typeof raw === "object" ? raw : {}
  ) as Partial<ProjectConfig>;
  return {
    ...config,
    enabled: Array.isArray(config.enabled)
      ? config.enabled.filter((name) => typeof name === "string")
      : [],
  };
}

export interface EnabledDiff {
  /** Names present in `next` but not in `current`. */
  added: string[];
  /** Names present in `current` but not in `next`. */
  removed: string[];
}

export function diffEnabled(current: string[], next: string[]): EnabledDiff {
  const currentSet = new Set(current);
  const nextSet = new Set(next);

  return {
    added: next.filter((name) => !currentSet.has(name)),
    removed: current.filter((name) => !nextSet.has(name)),
  };
}

/**
 * Produce the next config object after changing the enabled list.
 * Per-module release refs of removed modules are pruned as well.
 */
export function withEnabledModules(
  config: ProjectConfig,
  nextEnabled: string[],
): ProjectConfig {
  const next: ProjectConfig = { ...config, enabled: nextEnabled };
  const enabledSet = new Set(nextEnabled);

  for (const key of ["microserviceReleaseRefs", "releaseRefs"] as const) {
    const refs = next[key];
    if (!refs) continue;
    const pruned: Record<string, string> = {};
    for (const [name, ref] of Object.entries(refs)) {
      if (enabledSet.has(name)) {
        pruned[name] = ref;
      }
    }
    next[key] = pruned;
  }

  return next;
}
