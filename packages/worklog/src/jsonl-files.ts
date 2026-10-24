import { closeSync, openSync, readFileSync, readdirSync, readSync, statSync } from "node:fs";
import { join } from "node:path";

/** First complete line of a file (reading at most 64 KiB); null when empty or unreadable. */
export function readFirstLine(filePath: string): string | null {
  try {
    const fd = openSync(filePath, "r");
    try {
      const buffer = Buffer.alloc(64 * 1024);
      const bytesRead = readSync(fd, buffer, 0, buffer.length, 0);
      const text = buffer.subarray(0, bytesRead).toString("utf8");
      const newline = text.indexOf("\n");
      const line = newline === -1 ? text : text.slice(0, newline);
      return line.trim() ? line : null;
    } finally {
      closeSync(fd);
    }
  } catch {
    return null;
  }
}

/** Complete lines appended after `offset`; a partial trailing line is left for the next run. */
export function readCompleteLines(filePath: string, offset: number): { lines: string[]; nextOffset: number } {
  const size = statSync(filePath).size;
  if (size <= offset) return { lines: [], nextOffset: offset };
  const bytes = readFileSync(filePath);
  const slice = bytes.subarray(offset);
  const lastNewline = slice.lastIndexOf(0x0a);
  if (lastNewline === -1) return { lines: [], nextOffset: offset };
  const text = slice.subarray(0, lastNewline + 1).toString("utf8");
  return { lines: text.split("\n").filter((line) => line.trim()), nextOffset: offset + lastNewline + 1 };
}

/** Recursively yields `.jsonl` files under `root`; unreadable entries are skipped. */
export function* walkJsonl(root: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return;
  }
  for (const entry of entries) {
    const absolute = join(root, entry);
    try {
      const stats = statSync(absolute);
      if (stats.isDirectory()) {
        yield* walkJsonl(absolute);
      } else if (stats.isFile() && absolute.endsWith(".jsonl")) {
        yield absolute;
      }
    } catch {
      continue;
    }
  }
}
