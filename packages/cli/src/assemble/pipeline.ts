import fs from "node:fs/promises";
import path from "node:path";

import { cyan } from "colorette";

import {
  diffEnabled,
  ProjectConfig,
  withEnabledModules,
} from "../core/project-config";
import { MODULES_DIR } from "../constants/paths";
import { ALL_MODULE_NAMES, MODULES, ModuleMeta } from "../modules-catalog";
import { IssueBag } from "../lib/issues";
import { writeProjectConfig } from "../lib/project-config";
import { Sink } from "../lib/sink";

import { assembleDependencies } from "./dependencies";
import { assembleEnv, assembleEnvExample } from "./env";
import { assembleNestJsAssets } from "./assets";
import { assembleNestJsModules } from "./modules";
import { addRepositories, removeRepositories } from "./repositories";
import { assembleSchemaFiles } from "./schema";

export interface PipelineContext {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  config: ProjectConfig;
  isNewbieDeveloper: boolean;
  skipPrismaGenerate?: boolean;
}

export interface PlannedChange {
  added: ModuleMeta[];
  removed: ModuleMeta[];
  enabledNames: string[];
}

function resolveModules(issues: IssueBag, names: string[]): ModuleMeta[] {
  const result: ModuleMeta[] = [];
  for (const name of names) {
    const meta = MODULES[name];
    if (!meta) {
      issues.warn(`Unknown module '${name}' in config; ignoring.`);
      continue;
    }
    result.push(meta);
  }
  return result;
}

function step(title: string): void {
  console.info(`\n${cyan("→")} ${title}`);
}

/** Folder names currently present under src/microservices. */
export async function readProjectModuleDirs(cwd: string): Promise<string[]> {
  try {
    const dirents = await fs.readdir(path.resolve(cwd, MODULES_DIR), {
      withFileTypes: true,
    });
    return dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch {
    return [];
  }
}

export async function applyPlanned(
  ctx: PipelineContext,
  changes: PlannedChange,
): Promise<void> {
  await runSteps(ctx, changes);
}

async function runSteps(
  ctx: PipelineContext,
  changes: PlannedChange,
): Promise<void> {
  const { cwd, sink, issues, config, isNewbieDeveloper, skipPrismaGenerate } =
    ctx;
  const { added, removed, enabledNames } = changes;
  const enabled = resolveModules(issues, enabledNames);

  if (added.length > 0) {
    step("Clone code repositories");
    await addRepositories({
      cwd,
      sink,
      config,
      modules: added,
      isNewbieDeveloper,
    });
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
  await assembleNestJsModules({ cwd, sink, issues, enabledNames });

  step("Update package dependencies");
  await assembleDependencies({ cwd, sink, issues, added, removed, enabled });

  if (removed.length > 0) {
    step("Delete code repositories");
    await removeRepositories({
      cwd,
      sink,
      modules: removed,
      isNewbieDeveloper,
    });
  }

  step("Update .env.example");
  await assembleEnvExample({ cwd, sink, issues, enabled });
}

/**
 * Interactive `newbie` flow: config.enabled changes from old to next.
 * Persists the new enabled set before assembling (legacy behaviour).
 */
export async function applyModuleChanges(
  ctx: PipelineContext,
  nextEnabled: string[],
): Promise<{ added: string[]; removed: string[] }> {
  const { cwd, sink, config } = ctx;
  const diff = diffEnabled(config.enabled, nextEnabled);
  const added = resolveModules(ctx.issues, diff.added);
  const removed = resolveModules(ctx.issues, diff.removed);

  await writeProjectConfig(cwd, sink, withEnabledModules(config, nextEnabled));

  await runSteps(ctx, { added, removed, enabledNames: nextEnabled });
  return { added: diff.added, removed: diff.removed };
}

/**
 * `newbie install` planning (read-only): config is the source of truth;
 * modules missing from src/microservices are "installed", extra folders are
 * "uninstalled". The enabled list in config.json is never modified.
 */
export async function planReconcile(
  ctx: PipelineContext,
): Promise<PlannedChange & { installed: string[]; uninstalled: string[] }> {
  const { issues } = ctx;
  const inProject = new Set(await readProjectModuleDirs(ctx.cwd));
  const enabledSet = new Set(ctx.config.enabled);

  const installedNames = ctx.config.enabled.filter(
    (name) => ALL_MODULE_NAMES.includes(name) && !inProject.has(name),
  );
  const uninstalledNames = [...inProject].filter(
    (name) => ALL_MODULE_NAMES.includes(name) && !enabledSet.has(name),
  );

  return {
    added: resolveModules(issues, installedNames),
    removed: resolveModules(issues, uninstalledNames),
    enabledNames: ctx.config.enabled,
    installed: installedNames,
    uninstalled: uninstalledNames,
  };
}
