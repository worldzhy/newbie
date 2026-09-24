import fs from "node:fs/promises";
import path from "node:path";

import { GIT_MODULES, CONFIG_DIR, MODULES_DIR } from "../constants/paths";
import { ProjectConfig } from "../core/project-config";
import { ModuleMeta } from "../modules-catalog";
import { CliError } from "../lib/errors";
import { execCapture } from "../lib/exec";
import {
  checkoutReleaseRef,
  fetchReleaseRefs,
  fileExists,
  getCurrentCommit,
  getReleaseRefCandidates,
  setModuleReleaseRef,
} from "../lib/release";
import { Sink } from "../lib/sink";

/**
 * Defense in depth: even though catalog paths are compile-time constants, make
 * sure nothing can ever make the CLI delete outside src/microservices/.
 */
function assertModulePathSafe(cwd: string, srcPath: string): void {
  const modulesRoot = path.resolve(cwd, MODULES_DIR);
  const resolved = path.resolve(cwd, srcPath);
  const relative = path.relative(modulesRoot, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).length !== 1
  ) {
    throw new CliError(
      `[Error] Refusing to operate outside ${MODULES_DIR}: ${srcPath}`,
    );
  }
}

async function removeGitSubmoduleSection(
  cwd: string,
  sink: Sink,
  srcPath: string,
): Promise<void> {
  if (sink.dryRun) {
    await sink.run("git", [
      "config",
      "--remove-section",
      `submodule.${srcPath}`,
    ]);
    return;
  }
  try {
    await execCapture(
      "git",
      ["config", "--remove-section", `submodule.${srcPath}`],
      { cwd },
    );
  } catch {
    // Section already absent: removal is idempotent.
  }
}

/** Resolve and pin one cloned module, returning the ref actually used. */
async function pinModuleRelease(
  cwd: string,
  sink: Sink,
  config: ProjectConfig,
  meta: ModuleMeta,
): Promise<string> {
  const candidates = await getReleaseRefCandidates(cwd, config, meta);
  if (candidates.length === 0) {
    console.warn(
      `[warn] Cannot find a semantic release tag for ${meta.key}; using the cloned commit.`,
    );
    return getCurrentCommit(cwd, meta.srcPath);
  }

  await fetchReleaseRefs(cwd, meta.srcPath);
  for (const ref of candidates) {
    try {
      return await checkoutReleaseRef(cwd, meta.srcPath, [ref]);
    } catch {
      // Try the next candidate.
    }
  }

  console.warn(
    `[warn] Cannot checkout release ref ${candidates.join(" or ")} in ${meta.key}; using cloned commit.`,
  );
  return getCurrentCommit(cwd, meta.srcPath);
}

/**
 * Clone module repositories as git submodules, pin them to the resolved
 * release tag and copy their .newbie settings into the project config dir.
 */
export async function addRepositories(params: {
  cwd: string;
  sink: Sink;
  config: ProjectConfig;
  modules: ModuleMeta[];
  isNewbieDeveloper: boolean;
}): Promise<void> {
  const { cwd, sink, config, modules, isNewbieDeveloper } = params;

  if (
    isNewbieDeveloper &&
    !sink.dryRun &&
    !(await fileExists(cwd, GIT_MODULES))
  ) {
    await sink.writeText(GIT_MODULES, "");
  }

  for (const meta of modules) {
    assertModulePathSafe(cwd, meta.srcPath);

    if (!sink.dryRun && (await fileExists(cwd, meta.srcPath))) {
      await sink.remove(meta.srcPath);
    }

    await sink.run(
      "git",
      ["submodule", "add", "--force", meta.repositoryUrl, meta.srcPath],
      `git submodule add ${meta.key}`,
    );

    if (sink.dryRun) {
      console.info(
        `[dry-run] would pin a release tag and copy settings for ${meta.key}`,
      );
      continue;
    }

    const releaseRef = await pinModuleRelease(cwd, sink, config, meta);
    await setModuleReleaseRef(cwd, sink, config, meta.key, releaseRef);

    // Copy the module's .newbie settings/schema bundle into .newbie/.config/<key>
    const moduleDotNewbie = path.posix.join(meta.srcPath, ".newbie");
    if (await fileExists(cwd, moduleDotNewbie)) {
      await fs.cp(
        path.resolve(cwd, moduleDotNewbie),
        path.resolve(cwd, CONFIG_DIR, meta.key),
        { recursive: true },
      );
    }

    if (!isNewbieDeveloper) {
      await sink.run(
        "git",
        ["rm", "-r", "--cached", meta.srcPath],
        `unindex ${meta.key}`,
      );
      await removeGitSubmoduleSection(cwd, sink, meta.srcPath);
      await sink.remove(path.posix.join(".git/modules", meta.srcPath));
      await sink.remove(moduleDotNewbie);
    }
  }

  if (!isNewbieDeveloper) {
    await sink.remove(GIT_MODULES);
  }
}

/** Delete module source + copied settings, and tear down submodule links. */
export async function removeRepositories(params: {
  cwd: string;
  sink: Sink;
  modules: ModuleMeta[];
  isNewbieDeveloper: boolean;
}): Promise<void> {
  const { cwd, sink, modules, isNewbieDeveloper } = params;

  for (const meta of modules) {
    assertModulePathSafe(cwd, meta.srcPath);

    await sink.remove(path.posix.join(CONFIG_DIR, meta.key));

    if (isNewbieDeveloper && !sink.dryRun) {
      try {
        await sink.run(
          "git",
          ["rm", "-rf", meta.srcPath],
          `git rm ${meta.key}`,
        );
        await removeGitSubmoduleSection(cwd, sink, meta.srcPath);
        await sink.remove(path.posix.join(".git/modules", meta.srcPath));
      } catch (error) {
        throw new CliError(
          `[Error] Failed to remove submodule ${meta.key}: ${(error as Error).message}`,
        );
      }
    } else {
      await sink.remove(meta.srcPath);
    }
  }
}
