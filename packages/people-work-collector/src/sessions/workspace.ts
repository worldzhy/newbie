import { relative, resolve, sep } from "node:path";

import type { CollectorWorkspaceConfig } from "../config";

/** Path containment check that is robust against partial names. */
export function isInside(path: string, root: string): boolean {
  const absolutePath = resolve(path);
  const absoluteRoot = resolve(root);
  return absolutePath === absoluteRoot || absolutePath.startsWith(`${absoluteRoot}${sep}`);
}

/**
 * Trae names a project memory directory after the workspace root path with
 * "/" replaced by "-" (leading "-" kept), suffixed by `--p2-<hash>` — e.g.
 * `/Users/w/work` → `-Users-w-work--p2-abc…`. The hash is not invertible, so
 * matching is done by computing the prefix for each declared workspace.
 */
export function traeSlugPrefix(rootPath: string): string {
  return resolve(rootPath).split(sep).join("-");
}

/** Resolves which company workspace a Trae memory file belongs to, if any. */
export function traeMemoryWorkspaceFor(
  filePath: string,
  traeMemoryRoot: string,
  companyWorkspaces: CollectorWorkspaceConfig[],
): CollectorWorkspaceConfig | null {
  const slugDirectory = relative(traeMemoryRoot, filePath).split(sep)[0];
  if (!slugDirectory) return null;
  for (const workspace of companyWorkspaces) {
    const prefix = traeSlugPrefix(workspace.rootPath);
    if (slugDirectory === prefix || slugDirectory.startsWith(`${prefix}--p2-`)) return workspace;
  }
  return null;
}
