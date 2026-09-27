import figlet from "figlet";
import { checkbox, select } from "@inquirer/prompts";
import { bold, cyan, green, inverse, yellow } from "colorette";

import { runSteps } from "../assemble/pipeline";
import { diffSnapshots, driftPatchIds } from "../core/drift";
import { moduleKeys } from "../core/modules-state";
import { snapshotInstalledModule, snapshotPristineModule } from "../lib/drift";
import { fileExists } from "../lib/fs-util";
import { MODULES_DIR } from "../constants/paths";
import { writeModulesState } from "../lib/modules-state";

import { CliError } from "../lib/errors";

import { createContext, GlobalOptions } from "./shared";

type UpdateStatus = "missing" | "drifted" | "update-available" | "up-to-date";

interface UpdateInspection {
  key: string;
  status: UpdateStatus;
  fromCommit: string | null;
  toCommit: string | null;
  patchIds: string[];
}

const short = (commit: string | null): string => (commit ? commit.slice(0, 7) : "unknown");

/** Split a `--keys` flag value: accepts comma and/or space separated input. */
export function parseKeysFlag(input: string[] | undefined): string[] | undefined {
  if (!input) return undefined;
  const keys = input
    .flatMap((chunk) => chunk.split(","))
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
  return [...new Set(keys)];
}

export async function runUpdate(
  options: GlobalOptions & {
    all?: boolean;
    yes?: boolean;
    force?: boolean;
    /** Non-interactive single/multi module selector, e.g. --keys a,b. */
    keys?: string[];
  },
): Promise<void> {
  console.info(
    figlet.textSync("Newbie", {
      font: "Epic",
      width: 80,
      whitespaceBreak: true,
    }),
  );

  const { ctx } = await createContext(options, { fetch: true });
  const { cwd, sink, registry, state } = ctx;

  const keys = moduleKeys(state);
  if (keys.length === 0) {
    console.info("\n[info] No modules are enabled.\n");
    return;
  }

  const targetCommit = registry.sourceCommit;
  const inspections: UpdateInspection[] = [];

  for (const key of keys) {
    process.stdout.write(`Checking ${key}...\r`);
    const record = state.modules.find((entry) => entry.key === key);
    const fromCommit = record?.sourceCommit ?? null;
    const base: UpdateInspection = {
      key,
      status: "up-to-date",
      fromCommit,
      toCommit: targetCommit,
      patchIds: [],
    };

    if (!(await fileExists(cwd, `${MODULES_DIR}/${key}`))) {
      inspections.push({ ...base, status: "missing" });
      continue;
    }
    if (fromCommit && targetCommit && fromCommit === targetCommit) {
      inspections.push(base);
      continue;
    }

    // Guard local customisation: compare the copy with its pinned pristine tree.
    if (fromCommit && !options.force) {
      const pristine = await snapshotPristineModule(registry, key, fromCommit);
      if (pristine) {
        const drift = diffSnapshots(await snapshotInstalledModule(cwd, key), pristine);
        if (!drift.clean) {
          inspections.push({
            ...base,
            status: "drifted",
            patchIds: driftPatchIds(drift),
          });
          continue;
        }
      }
    }

    inspections.push({ ...base, status: "update-available" });
  }
  process.stdout.write("\x1b[2K\r");

  for (const result of inspections) {
    if (result.status === "missing") {
      console.info(yellow(`[skip] ${result.key}: directory missing; run 'newbie install'.`));
    } else if (result.status === "drifted") {
      console.info(
        yellow(
          `[skip] ${result.key}: local changes detected (${result.patchIds.length} file(s)); re-run with --force to overwrite.`,
        ),
      );
    }
  }

  const updatable = inspections.filter((result) => result.status === "update-available");
  if (updatable.length === 0) {
    console.info(green("\n[info] All modules are up to date.\n"));
    return;
  }

  let selected: UpdateInspection[];
  if (options.keys) {
    const enabled = new Set(keys);
    const unknown = options.keys.filter((key) => !enabled.has(key));
    if (unknown.length > 0) {
      throw new CliError(`Unknown or disabled module(s) in --keys: ${unknown.join(", ")}. Enabled: ${keys.join(", ")}`);
    }
    const updatableKeys = new Set(updatable.map((result) => result.key));
    for (const key of options.keys) {
      if (!updatableKeys.has(key)) {
        const inspection = inspections.find((result) => result.key === key);
        if (inspection?.status === "up-to-date") {
          console.info(green(`[info] ${key}: already up to date.`));
        }
      }
    }
    selected = updatable.filter((result) => options.keys!.includes(result.key));
    if (selected.length === 0) {
      console.info(green("\n[info] Nothing to update for the given --keys.\n"));
      return;
    }
  } else if (options.all || options.dryRun) {
    selected = updatable;
  } else {
    const selectedKeys = await checkbox({
      message: "Which modules do you want to update:",
      choices: updatable.map((result) => ({
        value: result.key,
        name: `${result.key} ${inverse(short(result.fromCommit))} -> ${cyan(short(result.toCommit))}`,
        checked: true,
      })),
      pageSize: 100,
      loop: true,
    });
    selected = updatable.filter((result) => selectedKeys.includes(result.key));
  }

  if (selected.length === 0) {
    console.info("\n[info] No modules selected.\n");
    return;
  }

  if (!options.yes && !options.dryRun) {
    const confirmed = await select({
      message: `Do you want to UPDATE ${cyan(selected.map((result) => result.key).join(", "))}?`,
      choices: [
        { name: "Yes", value: "yes" },
        { name: "No", value: "no" },
      ],
    });
    if (confirmed !== "yes") {
      console.info("\n[info] Update cancelled.\n");
      return;
    }
  }

  const selectedKeys = selected.map((result) => result.key);
  await runSteps(ctx, {
    added: selectedKeys,
    removed: [],
    enabledKeys: keys,
  });
  if (!sink.dryRun) {
    await writeModulesState(cwd, sink, ctx.state);
  }

  ctx.issues.assertEmpty();
  console.info(bold(green("\nC O M P L E T E\n")));
}
