import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
