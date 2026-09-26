import path from "node:path";

import { DriftReport } from "../core/drift";
import { MODULES_DIR } from "../constants/paths";
import { diffSnapshots } from "../core/drift";
import { moduleKeys } from "../core/modules-state";
import { collectMissingEnv } from "../lib/check";
import { snapshotInstalledModule, snapshotPristineModule } from "../lib/drift";
import { fileExists } from "../lib/fs-util";
import { readInstalledManifest } from "../lib/module-install";
import { readModulesState } from "../lib/modules-state";
import { resolveRegistry } from "../lib/registry";

import { GlobalOptions } from "./shared";

/**
 * Machine-readable project state for module-hub/agent consumers.
 * This command never mutates anything and never touches the network.
 */
export async function runStatus(
  options: GlobalOptions & { drift?: boolean },
): Promise<void> {
  const cwd = path.resolve(options.cwd);
  const state = await readModulesState(cwd);
  const registry = await resolveRegistry({ fetch: false });
  const keys = moduleKeys(state);
  const missingEnv = await collectMissingEnv(cwd, keys);

  interface StatusModule {
    key: string;
    version: string | null;
    sourceCommit: string | null;
    localPatches: string[];
    installed: boolean;
    hasSchema: boolean;
    missingEnv: string[];
    updateAvailable: boolean;
    drift?: DriftReport;
  }
  const modules: StatusModule[] = [];
  for (const record of state.modules) {
    const key = record.key;
    const installed = await fileExists(cwd, `${MODULES_DIR}/${key}`);
    const manifest = installed ? await readInstalledManifest(cwd, key) : null;

    const entry: StatusModule = {
      key,
      version: record.version,
      sourceCommit: record.sourceCommit,
      localPatches: record.localPatches,
      installed,
      hasSchema: Boolean(manifest?.schema),
      missingEnv: missingEnv[key] ?? [],
      updateAvailable: Boolean(
        registry?.sourceCommit &&
          record.sourceCommit &&
          registry.sourceCommit !== record.sourceCommit,
      ),
    };

    if (options.drift && installed && registry && record.sourceCommit) {
      const pristine = await snapshotPristineModule(
        registry,
        key,
        record.sourceCommit,
      );
      if (pristine) {
        entry.drift = diffSnapshots(
          await snapshotInstalledModule(cwd, key),
          pristine,
        );
      }
    }

    modules.push(entry);
  }

  const output = {
    cwd,
    registry: registry
      ? {
          available: true,
          local: registry.local,
          path: registry.root,
          sourceCommit: registry.sourceCommit,
        }
      : { available: false },
    modules,
  };

  console.info(JSON.stringify(output, null, 2));
}
