import fs from "node:fs/promises";
import path from "node:path";

/** Promise-based existence check for an absolute path that never throws. */
export async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/** Promise-based existence check that never throws. */
export async function fileExists(cwd: string, relativePath: string): Promise<boolean> {
  try {
    await fs.stat(path.resolve(cwd, relativePath));
    return true;
  } catch {
    return false;
  }
}
