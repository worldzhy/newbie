import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { Command } from "commander";

import { installedModuleDir } from "./module-install";
import { readInstalledManifest } from "./module-install";
import { CliError } from "./errors";
import { readModulesState, stateExists } from "./modules-state";
import { ModuleManifest } from "../core/module-manifest";
import { moduleKeys } from "../core/modules-state";
import { GlobalOptions } from "../commands/shared";

/**
 * Path of the module CLI entry inside the installed module directory. The
 * entry is a TypeScript file so iteration on a module CLI does not require a
 * rebuild of the consuming project.
 */
const CLI_ENTRY_RELATIVE = path.posix.join("cli", "index.ts");

/**
 * Hook a module exposes to attach its own subcommands to a namespace parent
 * (e.g. `newbie secrets pull` -> parent `secrets`, subcommand `pull`).
 *
 * The parent command is already created with the namespace declared in the
 * manifest's `cli` field; implementations only register descendants.
 */
export type ModuleCliRegister = (parent: Command, options: GlobalOptions) => void | Promise<void>;

interface ModuleCliEntry {
  register: ModuleCliRegister;
}

interface TsxApi {
  tsImport?: (specifier: string, parentURL: string) => Promise<Record<string, unknown>>;
}

/** Resolve a stable parent URL for tsx's programmatic loader. */
function parentModuleUrl(): string {
  if (typeof __filename === "string") {
    return pathToFileURL(__filename).href;
  }
  return pathToFileURL(process.cwd() + path.sep).href;
}

/**
 * Load a TypeScript module by path. Prefers tsx's programmatic API when the
 * host project still ships the entry as `.ts`; falls back to a native dynamic
 * import for production layouts that emit `.js` next to the source.
 */
async function loadEntryModule(specifier: string): Promise<Record<string, unknown>> {
  try {
    // @ts-expect-error `tsx/esm/api` is an ESM subpath export; our legacy
    // moduleResolution does not resolve it statically but Node does at runtime.
    const api = (await import("tsx/esm/api")) as TsxApi;
    if (typeof api.tsImport === "function") {
      return api.tsImport(specifier, parentModuleUrl());
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }
  return import(specifier);
}

/**
 * Load and validate a module's CLI entry. Returns null when the module does
 * not declare a CLI namespace; throws a CliError when the entry is missing or
 * malformed so the user can fix the manifest instead of debugging silence.
 */
export async function loadModuleCliEntry(
  cwd: string,
  key: string,
  manifest: ModuleManifest,
): Promise<{ namespace: string; entry: ModuleCliEntry } | null> {
  if (!manifest.cli) return null;

  const entryPath = path.join(installedModuleDir(cwd, key), CLI_ENTRY_RELATIVE);
  try {
    await fs.access(entryPath);
  } catch {
    throw new CliError(
      `Module '${key}' declares cli='${manifest.cli}' but entry 'src/modules/${key}/${CLI_ENTRY_RELATIVE}' is missing.`,
    );
  }

  const specifier = pathToFileURL(entryPath).href;
  let mod: Record<string, unknown>;
  try {
    mod = await loadEntryModule(specifier);
  } catch (error) {
    throw new CliError(`Failed to load cli entry for module '${key}' (${manifest.cli}): ${(error as Error).message}`);
  }

  if (typeof mod.register !== "function") {
    throw new CliError(`Module '${key}' cli entry must export a 'register(parent, options)' function.`);
  }
  return { namespace: manifest.cli, entry: { register: mod.register as ModuleCliRegister } };
}

/**
 * Walk the enabled module list in `modules.json`, load any manifest that
 * declares a `cli` namespace, and let each entry register its subcommands
 * under that namespace on the root program.
 *
 * Called before `program.parseAsync` so the dynamically-attached subcommands
 * are visible to argv parsing.
 */
export async function registerModuleCommands(program: Command, options: GlobalOptions): Promise<void> {
  if (!(await stateExists(options.cwd))) return;
  const state = await readModulesState(options.cwd);
  for (const key of moduleKeys(state)) {
    const manifest = await readInstalledManifest(options.cwd, key);
    if (!manifest) continue;
    const loaded = await loadModuleCliEntry(options.cwd, key, manifest);
    if (!loaded) continue;

    const parent = program.command(loaded.namespace);
    await loaded.entry.register(parent, options);
  }
}
