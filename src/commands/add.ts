import fs from "node:fs/promises";
import path from "node:path";
import { bold, cyan, green, yellow } from "colorette";

import { CliError } from "../lib/errors";
import { execInteractive } from "../lib/exec-interactive";
import { type LoadedItem, resolveInstallSet, resolveRegistryRoot } from "../registry/store";

export interface AddOptions {
  /** Requested item names (registryDependencies are pulled in automatically). */
  names: string[];
  /** Project root (global --cwd). */
  cwd?: string;
  /** Overwrite files that already exist. */
  force?: boolean;
  /** Do not run `npm install` for missing dependencies. */
  skipInstall?: boolean;
  /** Bundle the login-form block together with the requested items. */
  withLoginForm?: boolean;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

async function assertProjectRoot(projectRoot: string): Promise<void> {
  await fs.access(path.join(projectRoot, "package.json")).catch(() => {
    throw new CliError(`No package.json found in ${projectRoot}. Run 'fewbie add' inside a Next.js project.`);
  });
}

/** Extract the package name from an npm spec ("axios@^1" or "@scope/pkg@^2"). */
function packageNameOf(spec: string): string {
  if (spec.startsWith("@")) {
    const at = spec.indexOf("@", 1);
    return at === -1 ? spec : spec.slice(0, at);
  }
  return spec.split("@")[0];
}

/** npm package specs missing from the project's dependencies. */
async function missingPackages(projectRoot: string, specs: string[]): Promise<string[]> {
  const pkg = JSON.parse(await fs.readFile(path.join(projectRoot, "package.json"), "utf8")) as PackageJson;
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
  return specs.filter((spec) => !declared.has(packageNameOf(spec)));
}

/** Write one item's files into the project, honoring --force on conflicts. */
async function writeItemFiles(item: LoadedItem, projectRoot: string, force: boolean): Promise<string[]> {
  const written: string[] = [];
  const conflicts: string[] = [];

  for (const file of item.files) {
    const target = path.join(projectRoot, file.target);
    const exists = await fs
      .access(target)
      .then(() => true)
      .catch(() => false);
    if (exists && !force) {
      conflicts.push(file.target);
      continue;
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    const content = file.content ?? (await fs.readFile(file.source as string, "utf8"));
    await fs.writeFile(target, content);
    written.push(file.target);
  }

  if (conflicts.length > 0) {
    throw new CliError(
      `The following files already exist (re-run with --force to overwrite):\n  ${conflicts.join("\n  ")}`,
    );
  }
  return written;
}

export async function runAdd(options: AddOptions): Promise<void> {
  const projectRoot = path.resolve(options.cwd ?? process.cwd());
  await assertProjectRoot(projectRoot);

  const requested = [...options.names];
  if (options.withLoginForm && !requested.includes("login-form")) {
    requested.push("login-form");
  }

  const registryRoot = await resolveRegistryRoot();
  const items = await resolveInstallSet(registryRoot, requested);

  console.info(cyan(`Installing ${items.map((i) => i.manifest.name).join(", ")} into ${projectRoot}...`));

  const allWritten: string[] = [];
  for (const item of items) {
    const written = await writeItemFiles(item, projectRoot, options.force === true);
    allWritten.push(...written);
    console.info(`  ${green("✓")} ${item.manifest.name}`);
  }

  // Install npm dependencies declared by the items but missing from the
  // project manifest.
  const specs = [...new Set(items.flatMap((i) => i.manifest.dependencies ?? []))];
  const missing = await missingPackages(projectRoot, specs);
  if (missing.length > 0) {
    if (options.skipInstall) {
      console.info(yellow(`\nSkipped npm install. Add manually: npm install ${missing.join(" ")}`));
    } else {
      console.info(`\nInstalling dependencies: ${missing.join(", ")}`);
      await execInteractive("npm", ["install", ...missing], projectRoot);
    }
  }

  for (const file of allWritten) {
    console.info(`  ${green("added")} ${file}`);
  }

  const hints = items.map((i) => i.manifest.postInstall).filter((hint): hint is string => Boolean(hint));
  if (hints.length > 0) {
    console.info(`\n${bold("Next steps")}:`);
    for (const hint of hints) console.info(`  - ${hint}`);
  }
}
