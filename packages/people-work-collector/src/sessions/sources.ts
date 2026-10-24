import { basename } from "node:path";

import type { IdeKey } from "../config";
import { readTraeMemoryDelta } from "./trae-memory";
import { readTranscriptDelta } from "./transcript";
import type { SessionSource } from "./types";
import { isInside, traeMemoryWorkspaceFor } from "./workspace";

const CODEX_NO_CWD_NOTE =
  "Codex transcripts without a recorded working directory are skipped — only sessions carrying cwd can be scoped to a company workspace.";

const TRAE_MEMORY_FIDELITY_NOTE =
  'Trae sessions are the IDE\'s own session summaries (source "trae-memory"), not raw transcripts — lower fidelity by construction.';

/** Raw IDE transcripts (Claude Code, Codex): the recorded cwd decides the workspace. */
function transcriptSource(provenance: string, note?: string): SessionSource {
  return {
    provenance,
    accepts: () => true,
    readDelta: readTranscriptDelta,
    resolveWorkspace: ({ parsed, companyWorkspaces }) => {
      const rootPath = parsed.workspaceRootPath;
      if (!rootPath) return null;
      return companyWorkspaces.find((workspace) => isInside(rootPath, workspace.rootPath)) ?? null;
    },
    note,
  };
}

/** Trae exposes no transcripts, only the IDE's own session summaries. */
const traeSource: SessionSource = {
  provenance: "trae-memory",
  accepts: (filePath) => basename(filePath).startsWith("session_memory_"),
  readDelta: readTraeMemoryDelta,
  resolveWorkspace: ({ filePath, root, companyWorkspaces }) =>
    traeMemoryWorkspaceFor(filePath, root, companyWorkspaces),
  note: TRAE_MEMORY_FIDELITY_NOTE,
};

/**
 * One descriptor per supported IDE, keyed by `IdeKey` — the same key the
 * config uses under `sessionRoots`. A configured root for an unknown IDE is
 * ignored by construction.
 */
export const SESSION_SOURCES: Record<IdeKey, SessionSource> = {
  claude: transcriptSource("claude"),
  codex: transcriptSource("codex", CODEX_NO_CWD_NOTE),
  trae: traeSource,
};
