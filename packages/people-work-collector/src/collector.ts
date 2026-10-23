import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import type { CollectorConfig, CollectorState, FileProgress } from "./config";
import { scanDocuments } from "./documents";
import { readJsonlDelta } from "./session-source";
import { CollectorApi, UploadDocument, UploadSession } from "./uploader";

export interface CollectSummary {
  workspacesReported: number;
  sessionsUploaded: number;
  messagesUploaded: number;
  documentsUploaded: number;
  skippedSessions: number;
  notes: string[];
}

/** Sessions from these directories are considered; cwd decides the workspace. */
export async function collectOnce(
  config: CollectorConfig,
  state: CollectorState,
  api: CollectorApi,
): Promise<CollectSummary> {
  const summary: CollectSummary = {
    workspacesReported: 0,
    sessionsUploaded: 0,
    messagesUploaded: 0,
    documentsUploaded: 0,
    skippedSessions: 0,
    notes: [],
  };

  await api.reportWorkspaces(config.memberUserId, config.workspaces);
  summary.workspacesReported = config.workspaces.length;

  const companyWorkspaces = config.workspaces.filter((workspace) => workspace.isCompany);

  for (const [sourceName, root] of Object.entries(config.sessionSources)) {
    if (!root) continue;
    for (const filePath of walkJsonl(root)) {
      const progress = state.files[filePath];
      const delta = readJsonlDelta(filePath, progress?.offset ?? 0, progress?.nextSeq ?? 0);
      if (delta.parsed.messages.length === 0) {
        state.files[filePath] = {
          ...(progress ?? emptyProgress()),
          offset: delta.nextOffset,
        };
        continue;
      }

      const workspace = companyWorkspaces.find((candidate) =>
        delta.parsed.workspaceRootPath ? isInside(delta.parsed.workspaceRootPath, candidate.rootPath) : false,
      );

      if (!workspace) {
        // Recorded cwd is outside every company workspace (e.g. a personal
        // workspace) — advance the offset so it is not re-read, upload nothing.
        summary.skippedSessions++;
        state.files[filePath] = { ...(progress ?? emptyProgress()), offset: delta.nextOffset };
        continue;
      }

      const externalSessionId = delta.parsed.externalSessionId || progress?.sessionId || filePath;
      const aggregate = mergeAggregate(progress, delta.parsed.aggregate);
      const upload: UploadSession = {
        externalSessionId,
        workspaceKey: workspace.workspaceKey,
        model: aggregate.model,
        turnCount: aggregate.turnCount,
        messageCount: aggregate.messageCount,
        toolCallCount: aggregate.toolCallCount,
        toolNames: aggregate.toolNames,
        touchedFiles: aggregate.touchedFiles,
        durationMs: Math.max(0, new Date(aggregate.endedAt).getTime() - new Date(aggregate.startedAt).getTime()),
        startedAt: aggregate.startedAt,
        endedAt: aggregate.endedAt,
        messages: delta.parsed.messages,
      };

      await api.reportSessions(config.memberUserId, [upload]);
      summary.sessionsUploaded++;
      summary.messagesUploaded += delta.parsed.messages.length;

      state.files[filePath] = {
        ...aggregate,
        sessionId: externalSessionId,
        offset: delta.nextOffset,
        nextSeq: (progress?.nextSeq ?? 0) + delta.parsed.messages.length,
      };
    }

    if (sourceName === "codex") {
      summary.notes.push(
        "Codex transcripts without a recorded working directory are skipped — only sessions carrying cwd can be scoped to a company workspace.",
      );
    }
  }

  const documents: UploadDocument[] = scanDocuments(config, state);
  if (documents.length > 0) {
    await api.reportDocuments(config.memberUserId, documents);
    summary.documentsUploaded = documents.length;
  }

  return summary;
}

function mergeAggregate(
  progress: FileProgress | undefined,
  delta: {
    model: string;
    turnCount: number;
    messageCount: number;
    toolCallCount: number;
    toolNames: string[];
    touchedFiles: string[];
    startedAt: string;
    endedAt: string;
  },
): Omit<FileProgress, "offset" | "nextSeq" | "sessionId"> {
  const startedAt =
    progress && new Date(progress.startedAt) < new Date(delta.startedAt) ? progress.startedAt : delta.startedAt;
  const endedAt = progress && new Date(progress.endedAt) > new Date(delta.endedAt) ? progress.endedAt : delta.endedAt;

  return {
    model: delta.model || progress?.model || "",
    turnCount: (progress?.turnCount ?? 0) + delta.turnCount,
    messageCount: (progress?.messageCount ?? 0) + delta.messageCount,
    toolCallCount: (progress?.toolCallCount ?? 0) + delta.toolCallCount,
    toolNames: [...new Set([...(progress?.toolNames ?? []), ...delta.toolNames])],
    touchedFiles: [...new Set([...(progress?.touchedFiles ?? []), ...delta.touchedFiles])],
    startedAt,
    endedAt,
  };
}

function emptyProgress(): FileProgress {
  const now = new Date().toISOString();
  return {
    offset: 0,
    nextSeq: 0,
    sessionId: "",
    turnCount: 0,
    messageCount: 0,
    toolCallCount: 0,
    startedAt: now,
    endedAt: now,
    model: "",
    toolNames: [],
    touchedFiles: [],
  };
}

/** Path containment check that is robust against partial names. */
function isInside(path: string, root: string): boolean {
  const absolutePath = resolve(path);
  const absoluteRoot = resolve(root);
  return absolutePath === absoluteRoot || absolutePath.startsWith(`${absoluteRoot}/`);
}

function* walkJsonl(root: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return;
  }
  for (const entry of entries) {
    const absolute = join(root, entry);
    let stats;
    try {
      stats = statSync(absolute);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      yield* walkJsonl(absolute);
    } else if (stats.isFile() && absolute.endsWith(".jsonl")) {
      yield absolute;
    }
  }
}
