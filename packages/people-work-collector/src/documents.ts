import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

import type { CollectorConfig } from "./config";
import { redact } from "./redact";
import type { CollectorState } from "./state";
import type { UploadDocument } from "./api";

const DOCUMENT_EXTENSIONS = new Set([".md", ".markdown", ".txt"]);

/**
 * Declared-layer document scan (ADR-029 §8). Only directories configured as
 * company-work locations are walked; personal workspaces are never visited.
 * A document is re-uploaded only when its content hash changes.
 */
export function scanDocuments(config: CollectorConfig, state: CollectorState): UploadDocument[] {
  const documents: UploadDocument[] = [];
  const companyWorkspaces = config.workspaces.filter((workspace) => workspace.isCompany);

  for (const workspace of companyWorkspaces) {
    for (const directory of config.documentDirectories) {
      const absoluteDirectory = join(workspace.rootPath, directory);
      for (const filePath of walk(absoluteDirectory)) {
        const extension = filePath.slice(filePath.lastIndexOf("."));
        if (!DOCUMENT_EXTENSIONS.has(extension)) continue;

        const stats = statSync(filePath);
        if (stats.size > config.maxDocumentBytes) continue;

        const content = readFileSync(filePath, "utf8");
        const hash = createHash("sha256").update(content).digest("hex");
        const refPath = relative(workspace.rootPath, filePath);
        if (state.documents[filePath]?.hash === hash) continue;

        documents.push({
          workspaceKey: workspace.workspaceKey,
          title: basename(filePath),
          refPath,
          content: redact(content),
          capturedAt: stats.mtime.toISOString(),
        });
        state.documents[filePath] = { hash, workspaceKey: workspace.workspaceKey };
      }
    }
  }

  return documents;
}

function* walk(directory: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }
  for (const entry of entries) {
    const absolute = join(directory, entry);
    let stats;
    try {
      stats = statSync(absolute);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      yield* walk(absolute);
    } else if (stats.isFile()) {
      yield absolute;
    }
  }
}
