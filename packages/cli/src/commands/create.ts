import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { bold, cyan, green } from "colorette";

import { CliError } from "../lib/errors";
import { execCapture } from "../lib/exec";

/** Repository that ships the starter template under templates/basic. */
const TEMPLATE_REPOSITORY_URL = "https://github.com/worldzhy/newbie.git";
const TEMPLATE_SUBDIR = "templates/basic";
/** Explicit local template root; useful for offline/development runs. */
const TEMPLATE_PATH_ENV = "NEWBIE_TEMPLATE_PATH";

/** Node/npm package-name rule (lowercase, scoped names allowed). */
const PACKAGE_NAME_RE = /^(?:@[a-z0-9][a-z0-9-._]*\/)?[a-z0-9][a-z0-9-._]*$/;

/** Directories/files never copied out of the template. */
const COPY_IGNORE = new Set([
  "node_modules",
  "dist",
  "generated",
  ".git",
  ".env",
]);

export interface CreateOptions {
  name: string;
  templatePath?: string;
  templateRef?: string;
  gitInit?: boolean;
  dryRun?: boolean;
}

/** Resolve the basic template: explicit path -> local checkout -> git clone. */
async function resolveTemplate(options: CreateOptions): Promise<string> {
  const explicit = options.templatePath ?? process.env[TEMPLATE_PATH_ENV];
  if (explicit) {
    const root = path.resolve(explicit);
    await fs.access(path.join(root, "package.json"));
    return root;
  }

  // Dev fallback: the CLI is executed from a newbie monorepo checkout.
  const localDev = path.resolve(__dirname, "..", "..", "..", "..", TEMPLATE_SUBDIR);
  if (
    await fs
      .access(path.join(localDev, "package.json"))
      .then(() => true)
      .catch(() => false)
  ) {
    return localDev;
  }

  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-template-"));
  const cloneArgs = ["clone", "--quiet"];
  if (!options.templateRef) cloneArgs.push("--depth", "1");
  if (options.templateRef) cloneArgs.push("--branch", options.templateRef);
  cloneArgs.push(TEMPLATE_REPOSITORY_URL, temp);
  await execCapture("git", cloneArgs);
  return path.join(temp, TEMPLATE_SUBDIR);
}

async function copyTemplate(from: string, to: string): Promise<void> {
  await fs.cp(from, to, {
    recursive: true,
    filter: (src) =>
      !COPY_IGNORE.has(path.basename(src)) || src === from,
  });
}

export async function runCreate(options: CreateOptions): Promise<void> {
  const { name } = options;
  if (!PACKAGE_NAME_RE.test(name) || name.length > 214) {
    throw new CliError(
      `Invalid project name '${name}'. Use a lowercase npm package name, e.g. my-project or @scope/my-project.`,
    );
  }

  const targetDir = path.resolve(process.cwd(), name);
  const existing = await fs.readdir(targetDir).catch(() => null);
  if (existing && existing.length > 0) {
    throw new CliError(`Target directory ${targetDir} is not empty.`);
  }

  console.info(cyan(`Creating project '${name}' from the basic template...`));
  const templateRoot = await resolveTemplate(options);

  if (options.dryRun) {
    console.info(`[dry-run] copy ${templateRoot} -> ${targetDir}`);
    console.info(`[dry-run] set package.json name to '${name}'`);
    if (options.gitInit !== false) console.info("[dry-run] git init");
    return;
  }

  await copyTemplate(templateRoot, targetDir);

  const packageJsonPath = path.join(targetDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
    name?: string;
    [key: string]: unknown;
  };
  packageJson.name = name;
  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  if (options.gitInit !== false) {
    await execCapture("git", ["init", "--quiet"], { cwd: targetDir });
  }

  console.info(green(bold("\n✓ Project created.\n")));
  console.info(`Next steps:\n  cd ${name}\n  npm install\n  newbie config\n`);
}
