import fs from "node:fs/promises";
import path from "node:path";
import { bold, cyan, green, red, yellow } from "colorette";

import { CliError } from "../lib/errors";
import { unifiedDiff } from "../lib/diff";
import { loadItem, resolveRegistryRoot } from "../registry/store";

export interface UpdateOptions {
  /** Project root (global --cwd). */
  cwd?: string;
  /** Apply changes instead of only printing the diff. */
  write?: boolean;
  /** Specific item names to update; defaults to all installed items. */
  names?: string[];
}

/** A file whose installed content differs from the registry source. */
interface OutdatedFile {
  item: string;
  target: string;
  current: string;
  latest: string;
}

/** List every item name available in the registry. */
async function listRegistryItems(registryRoot: string): Promise<string[]> {
  const entries = await fs.readdir(registryRoot, { withFileTypes: true });
  const names: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const hasItem = await fs
      .access(path.join(registryRoot, entry.name, "item.json"))
      .then(() => true)
      .catch(() => false);
    if (hasItem) names.push(entry.name);
  }
  return names.sort();
}

/** Read a file's content, returning null when it does not exist. */
async function readOrNull(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * Find installed registry items whose on-disk content differs from the
 * current registry source. Returns the list of outdated files.
 */
async function findOutdated(
  registryRoot: string,
  projectRoot: string,
  requested: string[],
): Promise<OutdatedFile[]> {
  const allItems = await listRegistryItems(registryRoot);
  const targets = requested.length > 0 ? requested : allItems;
  const outdated: OutdatedFile[] = [];

  for (const name of targets) {
    if (!allItems.includes(name)) {
      throw new CliError(`Registry item '${name}' not found.`);
    }
    const item = await loadItem(registryRoot, name);

    for (const file of item.files) {
      const current = await readOrNull(path.join(projectRoot, file.target));
      // Not installed — not "outdated", just absent. Skip silently unless
      // the user explicitly asked for this item.
      if (current === null) {
        if (requested.length > 0) {
          outdated.push({
            item: name,
            target: file.target,
            current: "",
            latest: file.content ?? (await fs.readFile(file.source as string, "utf8")),
          });
        }
        continue;
      }

      const latest =
        file.content ?? (await fs.readFile(file.source as string, "utf8"));
      if (current !== latest) {
        outdated.push({ item: name, target: file.target, current, latest });
      }
    }
  }

  return outdated;
}

export async function runUpdate(options: UpdateOptions): Promise<void> {
  const projectRoot = path.resolve(options.cwd ?? process.cwd());

  await fs.access(path.join(projectRoot, "package.json")).catch(() => {
    throw new CliError(
      `No package.json found in ${projectRoot}. Run 'fewbie update' inside a Next.js project.`,
    );
  });

  const registryRoot = await resolveRegistryRoot();
  const outdated = await findOutdated(
    registryRoot,
    projectRoot,
    options.names ?? [],
  );

  if (outdated.length === 0) {
    console.info(green("All installed items are up to date."));
    return;
  }

  console.info(
    cyan(
      `${outdated.length} file(s) differ from the registry:\n`,
    ),
  );

  for (const file of outdated) {
    const label = `${file.item} → ${file.target}`;
    console.info(bold(`# ${label}`));

    const diff = unifiedDiff(
      file.current,
      file.latest,
      `a/${file.target}`,
      `b/${file.target}`,
    );
    process.stdout.write(diff);
    console.info("");
  }

  if (options.write) {
    for (const file of outdated) {
      await fs.mkdir(path.dirname(path.join(projectRoot, file.target)), {
        recursive: true,
      });
      await fs.writeFile(path.join(projectRoot, file.target), file.latest);
      console.info(`${green("updated")} ${file.target}`);
    }
    console.info(
      green(`\nUpdated ${outdated.length} file(s). Review with git diff.`),
    );
  } else {
    console.info(
      yellow(
        `Re-run with --write to apply these changes, or apply them manually.`,
      ),
    );
  }
}
