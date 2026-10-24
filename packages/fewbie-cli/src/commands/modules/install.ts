import path from "node:path";
import { bold, cyan, green } from "colorette";

import {
  listRegistryItemNames,
  readItemFileContent,
  resolveInstallSet,
  resolveRegistryRoot,
} from "../../registry/store";
import { confirm } from "../../lib/confirm";
import { CliError } from "../../lib/errors";
import { pathExists } from "../../lib/fs-util";
import { missingPackages } from "../../lib/npm-spec";
import { assertProjectRoot } from "../../lib/project";
import { readModulesFile, requireModulesFile } from "../../lib/modules-file";
import { applyModuleSelection } from "./apply";

export interface ModulesInstallOptions {
  /** Project root (global --cwd). */
  cwd: string;
  /** Registry module names to declare (npm-style add); empty means reconcile. */
  names?: string[];
  /** CI gate: verify the declared set, its files and its dependencies; write nothing. */
  check?: boolean;
  yes?: boolean;
  force?: boolean;
  skipInstall?: boolean;
  /** Also declare the login-form block (convenience modifier). */
  withLoginForm?: boolean;
  dryRun?: boolean;
}

export async function runInstall(options: ModulesInstallOptions): Promise<void> {
  const projectRoot = path.resolve(options.cwd);
  await assertProjectRoot(projectRoot);

  const names = [...(options.names ?? [])];
  if (options.withLoginForm && !names.includes("login-form")) names.push("login-form");

  if (options.check) {
    if (names.length > 0) {
      throw new CliError(
        "`modules install --check` inspects the declared module set and does not accept module names.",
      );
    }
    await runInstallCheck(projectRoot);
    return;
  }

  // npm-style arity: with names = declare and land; without = reconcile the
  // declared set. Only the reconcile form requires an existing declaration.
  const declared =
    names.length > 0 ? ((await readModulesFile(projectRoot)) ?? []) : await requireModulesFile(projectRoot);
  const next = [...new Set([...declared, ...names])];

  const registryRoot = await resolveRegistryRoot();
  const nextItems = await resolveInstallSet(registryRoot, next);
  const declaredItems = await resolveInstallSet(registryRoot, declared);
  const declaredClosure = new Set(declaredItems.map((item) => item.manifest.name));
  const additions = nextItems.map((item) => item.manifest.name).filter((name) => !declaredClosure.has(name));

  if (additions.length > 0) {
    console.info(cyan(`Installing ${additions.join(", ")} into ${projectRoot}...`));
    const confirmed = await confirm(`Do you want to INSTALL ${additions.join(", ")}?`, options);
    if (!confirmed) {
      console.info("[info] Cancelled.");
      return;
    }
  }

  const result = await applyModuleSelection({
    projectRoot,
    current: declared,
    next,
    force: options.force,
    skipInstall: options.skipInstall,
    dryRun: options.dryRun,
  });

  if (result.written.length === 0 && result.deleted.length === 0 && additions.length === 0) {
    console.info(green("[info] Project is in sync with fewbie.json."));
  } else if (options.dryRun) {
    console.info("[dry-run] no files were modified");
  } else {
    console.info(bold(green("\n✓ Modules installed.")));
  }
}

/**
 * CI gate (ADR-024 F7 for fewbie): prove the declaration is complete, every
 * declared file exists, and every declared npm dependency is installed.
 * Content drift is `modules update --check`'s job.
 */
async function runInstallCheck(projectRoot: string): Promise<void> {
  const declared = await requireModulesFile(projectRoot);
  const registryRoot = await resolveRegistryRoot();
  const items = await resolveInstallSet(registryRoot, declared);

  const closure = items.map((item) => item.manifest.name);
  const undeclared = closure.filter((name) => !declared.includes(name));

  const missingFiles: string[] = [];
  for (const item of items) {
    for (const file of item.files) {
      if (!(await pathExists(path.join(projectRoot, file.target)))) {
        missingFiles.push(`${item.manifest.name}: ${file.target}`);
      }
    }
  }

  const specs = [...new Set(items.flatMap((item) => item.manifest.dependencies ?? []))];
  const missingDependencies = await missingPackages(projectRoot, specs);

  if (undeclared.length > 0 || missingFiles.length > 0 || missingDependencies.length > 0) {
    const lines = [
      ...undeclared.map((name) => `  - ${name}: required by the declared set but missing from fewbie.json`),
      ...missingFiles.map((entry) => `  - ${entry}: file missing`),
      ...missingDependencies.map((spec) => `  - ${spec}: npm dependency not installed`),
    ];
    throw new CliError(
      `Declared module set is incomplete:\n${lines.join("\n")}\n` + "Run `fewbie modules install` to converge it.",
    );
  }

  // Read every declared file once so an unreadable registry item fails the gate
  // rather than silently passing.
  for (const item of items) {
    for (const file of item.files) await readItemFileContent(file);
  }

  const available = await listRegistryItemNames(registryRoot);
  for (const name of declared) {
    if (!available.includes(name)) throw new CliError(`Registry item '${name}' not found.`);
  }

  console.info(green(bold("✓ Declared modules, their files and dependencies match fewbie.json.")));
}
