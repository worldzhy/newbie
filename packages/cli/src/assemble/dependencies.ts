import {
  buildInstallSpecs,
  planDependencyRemovals,
} from "../core/dependency-plan";
import { ModuleManifest } from "../core/module-manifest";
import { IssueBag, reportIssue } from "../lib/issues";
import { readInstalledManifest } from "../lib/module-install";
import { Sink } from "../lib/sink";

async function loadManifests(
  cwd: string,
  issues: IssueBag,
  sink: Sink,
  keys: string[],
  label: string,
): Promise<ModuleManifest[]> {
  const manifests: ModuleManifest[] = [];
  for (const key of keys) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) {
      reportIssue(
        issues,
        sink,
        `Missing newbie.module.json for '${key}'; dependencies of ${label} modules may be incomplete.`,
      );
      continue;
    }
    manifests.push(manifest);
  }
  return manifests;
}

export async function assembleDependencies(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: string[];
  removed: string[];
  enabled: string[];
}): Promise<void> {
  const { cwd, sink, issues, added, removed, enabled } = params;

  // [step 1] Install dependencies of added modules.
  const addedDecls = await loadManifests(cwd, issues, sink, added, "added");
  const { dependencies: addSpecs, devDependencies: addDevSpecs } =
    buildInstallSpecs(addedDecls);

  if (addSpecs.length > 0) {
    await sink.run("npm", ["install", ...addSpecs], "npm install");
  }
  if (addDevSpecs.length > 0) {
    await sink.run(
      "npm",
      ["install", "--save-dev", ...addDevSpecs],
      "npm install --save-dev",
    );
  }

  // [step 2] Uninstall deps that were only owned by removed modules.
  const enabledDecls = await loadManifests(
    cwd,
    issues,
    sink,
    enabled,
    "enabled",
  );
  const removedDecls = await loadManifests(
    cwd,
    issues,
    sink,
    removed,
    "removed",
  );
  const { dependencies: removeDeps, devDependencies: removeDevDeps } =
    planDependencyRemovals(removedDecls, enabledDecls);

  if (removeDeps.length > 0 || removeDevDeps.length > 0) {
    await sink.run(
      "npm",
      ["uninstall", ...removeDeps, ...removeDevDeps],
      "npm uninstall",
    );
  }
}
