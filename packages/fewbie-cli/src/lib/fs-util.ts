import fs from "node:fs/promises";

/** Whether an absolute path exists (any type). */
export async function pathExists(absolutePath: string): Promise<boolean> {
  return fs
    .access(absolutePath)
    .then(() => true)
    .catch(() => false);
}

/** Read a UTF-8 file, returning null when it is absent or unreadable. */
export async function readTextIfExists(absolutePath: string): Promise<string | null> {
  try {
    return await fs.readFile(absolutePath, "utf8");
  } catch {
    return null;
  }
}
