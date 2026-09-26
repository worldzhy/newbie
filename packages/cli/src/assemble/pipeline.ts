import fs from "node:fs/promises";
import path from "node:path";

import { cyan } from "colorette";

import {
  diffModuleKeys,
  ModulesState,
  moduleKeys,
  withModuleKeys,
} from "../core/modules-state";
import { MODULES_DIR, MODULE_MANIFEST_FILE } from "../constants/paths";
import { writeModulesState } from "../lib/modules-state";

import { assembleDependencies } from "./dependencies";
import { assembleEnv, assembleEnvExample } from "./env";
import { assembleNestJsAssets } from "./assets";
import { assembleNestJsModules } from "./modules";
import { addModules, removeModules } from "./modules-copy";
import { assembleSchemaFiles } from "./schema";
import { PipelineContext } from "./types";

export interface PlannedChange {
  added: string[];
  removed: string[];
  enabledKeys: string[];
}

function step(title: string): void {
  console.info(`\n${cyan("→")} ${title}`);
}

/** Folder names currently present under src/modules (with a manifest). */
export async function readProjectModuleDirs(cwd: string): Promise<string[]> {
  try {
    const dirents = await fs.readdir(path.resolve(cwd, MODULES_DIR), {
      withFileTypes: true,
    });
    const keys: string[] = [];
    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;
      try {
        await fs.stat(
          path.resolve(cwd, MODULES_DIR, dirent.name, MODULE_MANIFEST_FILE),
        );
        keys.push(dirent.name);
      } catch {
        // Folder without a manifest: not CLI-managed, ignore it.
      }
    }
    return keys;
  } catch {
    return [];
  }
}

/** Stamp freshly copied module records with the registry sourceCommit. */
function stampCopiedModules(
  state: ModulesState,
  addedKeys: string[],
  registry: { url: string; sourceCommit: string | null },
): ModulesState {
  const added = new Set(addedKeys);
  return {
    ...state,
    registry: {
      ...(state.registry ?? {}),
      url: registry.url,
      sourceCommit: registry.sourceCommit,
    },
    modules: state.modules.map((record) =>
      added.has(record.key)
        ? {
            ...record,
            version: null,
            sourceCommit: registry.sourceCommit,
            localPatches: [],
          }
        : record,
    ),
  };
}

export async function runSteps(
  ctx: PipelineContext,
  changes: PlannedChange,
): Promise<void> {
  const { cwd, sink, issues, registry, skipPrismaGenerate } = ctx;
  const { added, removed, enabledKeys } = changes;

  if (added.length > 0) {
    step("Copy modules from the registry");
    await addModules({ cwd, sink, registry, keys: added });
    if (!sink.dryRun) {
      ctx.state = stampCopiedModules(ctx.state, added, registry);
      await writeModulesState(cwd, sink, ctx.state);
    }
  }

  step("Update environment variables");
  await assembleEnv({ cwd, sink, issues, added, removed });

  step("Update database schema");
  await assembleSchemaFiles({
    cwd,
    sink,
    issues,
    added,
    removed,
    skipPrismaGenerate,
  });

  step("Update nestjs assets");
  await assembleNestJsAssets({ cwd, sink, issues, added, removed });

  step("Update nestjs modules");
  await assembleNestJsModules({ cwd, sink, issues, enabledKeys });

  step("Update package dependencies");
  await assembleDependencies({
    cwd,
    sink,
    issues,
    added,
    removed,
    enabled: enabledKeys,
  });

  if (removed.length > 0) {
    step("Delete module directories");
    await removeModules({ sink, keys: removed });
  }

  step("Update .env.example");
  await assembleEnvExample({ cwd, sink, issues, enabled: enabledKeys });
}

export async function applyPlanned(
  ctx: PipelineContext,
  changes: PlannedChange,
): Promise<void> {
  await runSteps(ctx, changes);
}

/**
 * Interactive/`apply` flow: modules.json changes from old keys to next keys.
 * The new state is persisted before assembling (legacy behaviour).
 */
export async function applyModuleKeys(
  ctx: PipelineContext,
  nextKeys: string[],
): Promise<{ added: string[]; removed: string[] }> {
  const { cwd, sink } = ctx;
  const diff = diffModuleKeys(moduleKeys(ctx.state), nextKeys);

  ctx.state = withModuleKeys(ctx.state, nextKeys);
  await writeModulesState(cwd, sink, ctx.state);

  await runSteps(ctx, {
    added: diff.added,
    removed: diff.removed,
    enabledKeys: nextKeys,
  });
  return diff;
}

/**
 * `newbie install` planning (read-only): modules.json is the source of truth;
 * modules missing from src/modules (or lacking a registry pin, e.g. after an
 * interrupted install) are reinstalled, extra copied modules are removed.
 * The module list in modules.json is never modified.
 */
export async function planReconcile(
  ctx: PipelineContext,
): Promise<PlannedChange & { installed: string[]; uninstalled: string[] }> {
  const inProject = new Set(await readProjectModuleDirs(ctx.cwd));
  const enabled = moduleKeys(ctx.state);
  const enabledSet = new Set(enabled);

  const installed = enabled.filter((key) => {
    if (!inProject.has(key)) return true;
    const record = ctx.state.modules.find((entry) => entry.key === key);
    return !record?.sourceCommit;
  });
  const uninstalled = [...inProject].filter((key) => !enabledSet.has(key));

  return {
    added: installed,
    removed: uninstalled,
    enabledKeys: enabled,
    installed,
    uninstalled,
  };
}
