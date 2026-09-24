import {
  buildInstallSpecs,
  planDependencyRemovals,
} from "../core/dependency-plan";
import { ModuleMeta } from "../modules-catalog";
import { IssueBag, reportIssue } from "../lib/issues";
import { ModuleSettings, readModuleSettings } from "../lib/module-settings";
import { Sink } from "../lib/sink";

async function loadSettings(
  cwd: string,
  issues: IssueBag,
  sink: Sink,
  modules: ModuleMeta[],
  label: string,
) {
  const decls: ModuleSettings[] = [];
  for (const meta of modules) {
    const settings = await readModuleSettings(cwd, meta);
    if (settings === null) {
      reportIssue(
        issues,
        sink,
        `Missing ${meta.key}.settings.json; dependencies of ${label} modules may be incomplete.`,
      );
      continue;
    }
    decls.push(settings);
  }
  return decls;
}

export async function assembleDependencies(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: ModuleMeta[];
  removed: ModuleMeta[];
  enabled: ModuleMeta[];
}): Promise<void> {
  const { cwd, sink, issues, added, removed, enabled } = params;

  // [step 1] Install dependencies of added modules.
  const addedDecls = await loadSettings(cwd, issues, sink, added, "added");
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
  const enabledDecls = await loadSettings(
    cwd,
    issues,
    sink,
    enabled,
    "enabled",
  );
  const removedDecls = await loadSettings(
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
