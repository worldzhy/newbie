import figlet from "figlet";
import { checkbox, select } from "@inquirer/prompts";
import { bold, cyan, green, inverse, yellow } from "colorette";

import { MODULES, ModuleMeta } from "../modules-catalog";
import {
  checkoutReleaseRef,
  fetchReleaseRefs,
  fileExists,
  getCurrentCommit,
  getUpdateReleaseRefCandidates,
  getWorkingTreeStatus,
  isGitRepository,
  resolveReleaseRef,
  setModuleReleaseRef,
} from "../lib/release";

import { createContext, GlobalOptions } from "./shared";

type InspectStatus =
  | "unknown"
  | "missing"
  | "not-git"
  | "dirty"
  | "update-available"
  | "up-to-date"
  | "missing-release";

interface InspectResult {
  name: string;
  meta: ModuleMeta | null;
  status: InspectStatus;
  currentCommit?: string;
  targetCommit?: string;
  releaseRef?: string;
  releaseRefCandidates: string[];
}

const shortCommit = (commit: string): string => commit.slice(0, 7);

async function inspectModule(
  cwd: string,
  name: string,
): Promise<InspectResult> {
  const meta = MODULES[name] ?? null;
  const base: InspectResult = {
    name,
    meta,
    status: "unknown",
    releaseRefCandidates: [],
  };
  if (!meta) return base;

  if (!(await fileExists(cwd, meta.srcPath)))
    return { ...base, status: "missing" };
  if (!(await isGitRepository(cwd, meta.srcPath)))
    return { ...base, status: "not-git" };
  if (await getWorkingTreeStatus(cwd, meta.srcPath))
    return { ...base, status: "dirty" };

  try {
    await fetchReleaseRefs(cwd, meta.srcPath);
    const candidates = await getUpdateReleaseRefCandidates(cwd, meta);
    const currentCommit = await getCurrentCommit(cwd, meta.srcPath);
    const target = await resolveReleaseRef(cwd, meta.srcPath, candidates);
    return {
      ...base,
      status:
        currentCommit === target.commit ? "up-to-date" : "update-available",
      currentCommit,
      targetCommit: target.commit,
      releaseRef: target.releaseRef,
      releaseRefCandidates: candidates,
    };
  } catch {
    return { ...base, status: "missing-release" };
  }
}

const SKIP_MESSAGES: Record<string, string> = {
  dirty: "local changes exist",
  "missing-release": "target release cannot be resolved",
  missing: "source directory is missing",
  "not-git": "source directory is not a Git repository",
  unknown: "unknown module",
};

export async function runUpdate(
  options: GlobalOptions & { all?: boolean; yes?: boolean },
): Promise<void> {
  console.info(
    figlet.textSync("Newbie", {
      font: "Epic",
      width: 80,
      whitespaceBreak: true,
    }),
  );

  const { ctx, config, sink } = await createContext(options);
  if (config.enabled.length === 0) {
    console.info("\n[info] No modules are enabled.\n");
    return;
  }

  const results: InspectResult[] = [];
  for (const name of config.enabled) {
    process.stdout.write(`Checking ${name}...\r`);
    results.push(await inspectModule(ctx.cwd, name));
  }
  process.stdout.write("\x1b[2K\r");

  for (const result of results) {
    if (
      result.status in SKIP_MESSAGES &&
      result.status !== "update-available"
    ) {
      console.info(
        yellow(`[skip] ${result.name}: ${SKIP_MESSAGES[result.status]}.`),
      );
    }
  }

  const updatable = results.filter(
    (result) => result.status === "update-available",
  );
  if (updatable.length === 0) {
    console.info(green("\n[info] All modules are up to date.\n"));
    return;
  }

  let selected: InspectResult[];
  if (options.all || options.dryRun) {
    selected = updatable;
  } else {
    const selectedNames = await checkbox({
      message: "Which modules do you want to update:",
      choices: updatable.map((result) => ({
        value: result.name,
        name: `${result.name} ${inverse(shortCommit(result.currentCommit!))} -> ${cyan(
          `${result.releaseRef}@${shortCommit(result.targetCommit!)}`,
        )}`,
        checked: true,
      })),
      pageSize: 100,
      loop: true,
    });
    selected = updatable.filter((result) =>
      selectedNames.includes(result.name),
    );
  }

  if (selected.length === 0) {
    console.info("\n[info] No modules selected.\n");
    return;
  }

  if (!options.yes && !options.dryRun) {
    const confirmed = await select({
      message: `Do you want to UPDATE ${cyan(selected.map((result) => result.name).join(", "))}?`,
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

  for (const result of selected) {
    if (!result.meta) continue;
    if (sink.dryRun) {
      console.info(`[dry-run] update ${result.name} -> ${result.releaseRef}`);
      continue;
    }
    await fetchReleaseRefs(ctx.cwd, result.meta.srcPath);
    const checkedOut = await checkoutReleaseRef(
      ctx.cwd,
      result.meta.srcPath,
      result.releaseRefCandidates,
    );
    await setModuleReleaseRef(ctx.cwd, sink, config, result.name, checkedOut);
    console.info(green(`[done] ${result.name} -> ${checkedOut}`));
  }

  console.info(bold(green("C O M P L E T E\n")));
}
