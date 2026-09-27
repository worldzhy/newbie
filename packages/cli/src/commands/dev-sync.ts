import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { cyan, green, yellow } from "colorette";

import { MODULES_DIR, MODULE_MANIFEST_FILE } from "../constants/paths";
import { CliError } from "../lib/errors";
import {
  moduleRootInRegistry,
  RegistryLocation,
  resolveRegistry,
} from "../lib/registry";

export interface DevSyncOptions {
  cwd: string;
  /** Watch every registry module instead of only installed ones. */
  all?: boolean;
}

/** Module keys currently copied into the project (have a manifest). */
async function installedModuleKeys(projectRoot: string): Promise<string[]> {
  const dir = path.join(projectRoot, MODULES_DIR);
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const keys: string[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const hasManifest = await fsp
        .access(path.join(dir, entry.name, MODULE_MANIFEST_FILE))
        .then(() => true)
        .catch(() => false);
      if (hasManifest) keys.push(entry.name);
    }
    return keys.sort();
  } catch {
    return [];
  }
}

/**
 * Copy one module's registry source tree into the project. Mirrors the
 * install pipeline's addModules behaviour but runs outside the full
 * assemble context (env/prisma wiring is left to `newbie install`).
 */
async function syncModule(
  projectRoot: string,
  registry: RegistryLocation,
  key: string,
): Promise<void> {
  const source = moduleRootInRegistry(registry.root, key);
  const target = path.join(projectRoot, MODULES_DIR, key);
  await fsp.rm(target, { recursive: true, force: true });
  await fsp.mkdir(path.dirname(target), { recursive: true });
  await fsp.cp(source, target, { recursive: true });
}

/** Debounce a callback so rapid successive events trigger only one sync. */
function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export async function runDevSync(options: DevSyncOptions): Promise<void> {
  const projectRoot = path.resolve(options.cwd);

  const registry = await resolveRegistry({ fetch: false });
  if (!registry) {
    throw new CliError(
      "dev-sync requires a local newbie-modules checkout. " +
        "Set NEWBIE_MODULES_PATH or place the repo at ~/src/newbie-modules.",
    );
  }
  if (!registry.local) {
    throw new CliError(
      "dev-sync only works with a local registry checkout, not the cached clone. " +
        "Set NEWBIE_MODULES_PATH to a local newbie-modules working tree.",
    );
  }

  const installed = await installedModuleKeys(projectRoot);
  const watchKeys = options.all
    ? (await listRegistryKeys(registry.root))
    : installed;

  if (watchKeys.length === 0) {
    console.info(
      yellow(
        options.all
          ? "No modules found in the registry."
          : "No modules installed in this project. Run `newbie install` first, or use --all to watch every registry module.",
      ),
    );
    return;
  }

  console.info(
    cyan(
      `Watching ${watchKeys.length} module(s) for changes in ${registry.root}…`,
    ),
  );
  console.info(`  ${watchKeys.join(", ")}`);
  console.info("Press Ctrl+C to stop.\n");

  const watchers: fs.FSWatcher[] = [];

  for (const key of watchKeys) {
    const sourceDir = moduleRootInRegistry(registry.root, key);
    try {
      await fsp.access(sourceDir);
    } catch {
      console.warn(yellow(`  ! ${key}: not found in registry, skipping`));
      continue;
    }

    const sync = debounce(() => {
      syncModule(projectRoot, registry, key)
        .then(() => {
          console.info(`${green("↻")} ${key} synced`);
        })
        .catch((err) => {
          console.warn(yellow(`  ! ${key}: sync failed: ${err.message}`));
        });
    }, 150);

    const watcher = fs.watch(
      sourceDir,
      { recursive: true },
      (_event, filename) => {
        if (filename) sync();
      },
    );
    watcher.on("error", (err) => {
      console.warn(yellow(`  ! watcher for ${key} error: ${err.message}`));
    });
    watchers.push(watcher);
  }

  // Keep the process alive until interrupted.
  process.on("SIGINT", () => {
    for (const w of watchers) w.close();
    console.info("\nStopped dev-sync.");
    process.exit(0);
  });
}

/** List all module keys in a registry working tree (local copy of listRegistryKeys). */
async function listRegistryKeys(registryRoot: string): Promise<string[]> {
  const dir = path.resolve(registryRoot, "packages", "modules");
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const keys: string[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const hasManifest = await fsp
        .access(path.join(dir, entry.name, MODULE_MANIFEST_FILE))
        .then(() => true)
        .catch(() => false);
      if (hasManifest) keys.push(entry.name);
    }
    return keys.sort();
  } catch {
    return [];
  }
}
