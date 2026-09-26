import path from "node:path";

import { MODULES_DIR } from "../constants/paths";
import {
  moduleRootInRegistry,
  RegistryLocation,
} from "../lib/registry";
import { CliError } from "../lib/errors";
import { Sink } from "../lib/sink";

/**
 * Defense in depth: even though keys come from the registry listing, make
 * sure nothing can ever make the CLI copy/delete outside src/modules/.
 */
export function assertModuleKeySafe(key: string): void {
  const resolved = path.resolve(MODULES_DIR, key);
  const relative = path.relative(MODULES_DIR, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).length !== 1
  ) {
    throw new CliError(
      `[Error] Refusing to operate outside ${MODULES_DIR}: ${key}`,
    );
  }
}

/**
 * Copy module sources from the newbie-modules registry into the project.
 * The module's newbie.module.json and prisma fragment travel with the copy,
 * so no separate settings synchronisation step is required.
 */
export async function addModules(params: {
  cwd: string;
  sink: Sink;
  registry: RegistryLocation;
  keys: string[];
}): Promise<void> {
  const { cwd, sink, registry, keys } = params;
  for (const key of keys) {
    assertModuleKeySafe(key);
    await sink.copy(
      moduleRootInRegistry(registry.root, key),
      path.posix.join(MODULES_DIR, key),
    );
  }
}

/** Delete a copied module directory (plain folder, never a git submodule). */
export async function removeModules(params: {
  sink: Sink;
  keys: string[];
}): Promise<void> {
  const { sink, keys } = params;
  for (const key of keys) {
    assertModuleKeySafe(key);
    await sink.remove(path.posix.join(MODULES_DIR, key));
  }
}
