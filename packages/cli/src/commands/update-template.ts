import fs from "node:fs/promises";
import path from "node:path";
import { bold, cyan, green, yellow } from "colorette";

import {
  MARKER_END,
  MARKER_START,
  planTemplateSync,
  SKELETON_FILES,
  SkeletonChange,
} from "../core/template-sync";
import { unifiedDiff } from "../core/unified-diff";
import { CliError } from "../lib/errors";
import { createSink } from "../lib/sink";
import { GlobalOptions } from "./shared";
import { resolveTemplate, TemplateReference } from "./create";

export interface UpdateTemplateOptions
  extends GlobalOptions,
    TemplateReference {
  /** Apply the changes instead of only printing the diff. */
  write?: boolean;
}

async function readOrNull(root: string, rel: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(root, rel), "utf8");
  } catch {
    return null;
  }
}

function printChangeDiff(change: SkeletonChange): void {
  const label = change.file.path;
  if (change.kind === "missing-markers") {
    console.warn(
      yellow(
        `! ${label}: framework markers (${MARKER_START} / ${MARKER_END}) ` +
          "not found; skipping. Add them back to re-enable template sync.",
      ),
    );
    return;
  }

  const kindLabel =
    change.kind === "create" ? "missing in project" : "differs from template";
  console.info(bold(`\n# ${label} (${kindLabel})`));

  const aLabel = change.currentComparable === null ? "/dev/null" : `a/${label}`;
  const diff = unifiedDiff(
    change.currentComparable ?? "",
    change.templateComparable ?? "",
    aLabel,
    `b/${label}`,
  );
  process.stdout.write(diff);
}

export async function runUpdateTemplate(
  options: UpdateTemplateOptions,
): Promise<void> {
  const cwd = path.resolve(options.cwd);
  const sink = createSink(cwd, options.dryRun);

  const template = await resolveTemplate(options);
  console.info(cyan(`Template source: ${template.source}`));

  const projectFiles = new Map<string, string | null>();
  const templateFiles = new Map<string, string | null>();
  for (const file of SKELETON_FILES) {
    projectFiles.set(file.path, await readOrNull(cwd, file.path));
    templateFiles.set(file.path, await readOrNull(template.root, file.path));
  }

  let changes: SkeletonChange[];
  try {
    changes = planTemplateSync(projectFiles, templateFiles);
  } catch (error) {
    throw new CliError((error as Error).message);
  }

  if (changes.length === 0) {
    console.info(
      green(bold("✓ Project skeleton is up to date with the template.")),
    );
    return;
  }

  const actionable = changes.filter((c) => c.kind !== "missing-markers");
  for (const change of changes) {
    printChangeDiff(change);
  }

  console.info(
    `\n${actionable.length} skeleton file(s) to sync: ` +
      actionable.map((c) => `${c.file.path} (${c.kind})`).join(", "),
  );

  if (!options.write) {
    console.info("\nNext steps:");
    console.info(
      "  newbie update-template --write   # apply these changes (supports --dry-run)",
    );
    console.info(
      "  git checkout -b chore/template-sync   # then review `git diff` and open a PR",
    );
    return;
  }

  for (const change of actionable) {
    if (change.nextContent !== null) {
      await sink.writeText(change.file.path, change.nextContent);
    }
  }
  if (options.dryRun) {
    console.info("[dry-run] no files were modified");
  } else {
    console.info(green(bold("\n✓ Skeleton files updated.")));
    console.info(
      "Review with `git diff`, then commit on a branch and open a PR.",
    );
  }
}
