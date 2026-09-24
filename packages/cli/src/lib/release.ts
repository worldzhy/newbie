import fs from "node:fs/promises";
import path from "node:path";

import { pickLatestSemverTag } from "../core/semver";
import { assertSafeGitRef } from "../core/git-ref";
import { RELEASE_REF_ENV } from "../constants/modes";
import { CONFIG_JSON } from "../constants/paths";
import { ProjectConfig } from "../core/project-config";
import { ModuleMeta } from "../modules-catalog";
import { execCapture, trim } from "./exec";

/** Resolve the explicit ref: NEWBIE_RELEASE_REF env > per-module config > module default > global. */
export async function getExplicitReleaseRef(
  config: ProjectConfig,
  meta: ModuleMeta,
): Promise<string | null> {
  if (process.env[RELEASE_REF_ENV]) {
    return assertSafeGitRef(process.env[RELEASE_REF_ENV]);
  }

  const perModule =
    config.microserviceReleaseRefs?.[meta.key] ??
    config.releaseRefs?.[meta.key];
  const candidate =
    perModule ??
    (meta as ModuleMeta & { releaseRef?: string }).releaseRef ??
    config.releaseRef;
  return candidate ? assertSafeGitRef(candidate) : null;
}

export async function getReleaseRefCandidates(
  cwd: string,
  config: ProjectConfig,
  meta: ModuleMeta,
): Promise<string[]> {
  const explicit = await getExplicitReleaseRef(config, meta);
  if (explicit) return [explicit];

  try {
    const latest = await getLatestReleaseRef(cwd, meta.srcPath);
    return latest ? [assertSafeGitRef(latest)] : [];
  } catch {
    return [];
  }
}

/** Update flow ignores per-module pins and always proposes the newest semver tag (env still wins). */
export async function getUpdateReleaseRefCandidates(
  cwd: string,
  meta: ModuleMeta,
): Promise<string[]> {
  if (process.env[RELEASE_REF_ENV]) {
    return [assertSafeGitRef(process.env[RELEASE_REF_ENV])];
  }
  return [assertSafeGitRef(await getLatestReleaseRef(cwd, meta.srcPath))];
}

export async function isGitRepository(
  cwd: string,
  targetPath: string,
): Promise<boolean> {
  try {
    return (
      trim(
        await execCapture(
          "git",
          ["-C", targetPath, "rev-parse", "--is-inside-work-tree"],
          { cwd },
        ),
      ) === "true"
    );
  } catch {
    return false;
  }
}

export async function fetchReleaseRefs(
  cwd: string,
  targetPath: string,
): Promise<void> {
  await execCapture(
    "git",
    ["-C", targetPath, "fetch", "--tags", "--force", "origin"],
    { cwd },
  );
}

export async function getLatestReleaseRef(
  cwd: string,
  targetPath: string,
): Promise<string | null> {
  const result = await execCapture("git", ["-C", targetPath, "tag", "--list"], {
    cwd,
  });
  return pickLatestSemverTag(
    result.stdout
      .split("\n")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );
}

export async function getCurrentCommit(
  cwd: string,
  targetPath: string,
): Promise<string> {
  return trim(
    await execCapture("git", ["-C", targetPath, "rev-parse", "HEAD"], { cwd }),
  );
}

export async function getWorkingTreeStatus(
  cwd: string,
  targetPath: string,
): Promise<string> {
  return trim(
    await execCapture("git", ["-C", targetPath, "status", "--porcelain"], {
      cwd,
    }),
  );
}

export async function resolveReleaseRef(
  cwd: string,
  targetPath: string,
  refs: string[],
): Promise<{ releaseRef: string; commit: string }> {
  let lastError: unknown;

  for (const ref of refs) {
    try {
      const commit = trim(
        await execCapture(
          "git",
          ["-C", targetPath, "rev-parse", "--verify", `${ref}^{commit}`],
          { cwd },
        ),
      );
      return { releaseRef: ref, commit };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `[Error] Cannot resolve release ref ${refs.join(" or ")} in ${targetPath}.`,
    { cause: lastError },
  );
}

export async function checkoutReleaseRef(
  cwd: string,
  targetPath: string,
  refs: string[],
): Promise<string> {
  const { releaseRef } = await resolveReleaseRef(cwd, targetPath, refs);
  await execCapture(
    "git",
    ["-C", targetPath, "checkout", "--detach", releaseRef],
    { cwd },
  );
  return releaseRef;
}

export async function setModuleReleaseRef(
  cwd: string,
  sink: { writeJson(file: string, value: unknown): Promise<void> },
  config: ProjectConfig,
  moduleKey: string,
  releaseRef: string,
): Promise<void> {
  const next: ProjectConfig = {
    ...config,
    microserviceReleaseRefs: {
      ...(config.microserviceReleaseRefs ?? {}),
      [moduleKey]: assertSafeGitRef(releaseRef),
    },
  };
  await sink.writeJson(CONFIG_JSON, next);
}

export async function fileExists(
  cwd: string,
  relativePath: string,
): Promise<boolean> {
  try {
    await fs.stat(path.resolve(cwd, relativePath));
    return true;
  } catch {
    return false;
  }
}
