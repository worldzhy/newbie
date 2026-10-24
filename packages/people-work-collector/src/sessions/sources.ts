import { basename } from "node:path";

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
const traeMemorySource: SessionSource = {
  provenance: "trae-memory",
  accepts: (filePath) => basename(filePath).startsWith("session_memory_"),
  readDelta: readTraeMemoryDelta,
  resolveWorkspace: ({ filePath, root, companyWorkspaces }) =>
    traeMemoryWorkspaceFor(filePath, root, companyWorkspaces),
  note: TRAE_MEMORY_FIDELITY_NOTE,
};

/** Keyed by `collector config.sessionSources` keys; unknown keys are ignored. */
export const SESSION_SOURCES: Record<string, SessionSource> = {
  claude: transcriptSource("claude"),
  codex: transcriptSource("codex", CODEX_NO_CWD_NOTE),
  traeMemory: traeMemorySource,
};
