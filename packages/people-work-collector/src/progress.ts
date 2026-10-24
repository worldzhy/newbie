import type { FileProgress } from "./config";
import type { SessionAggregate } from "./sessions/types";

export function emptyProgress(): FileProgress {
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

/**
 * Folds one read delta into the file's running totals. Session boundaries stay
 * stable across runs: the earliest start and the latest end win.
 */
export function mergeProgress(
  progress: FileProgress | undefined,
  aggregate: SessionAggregate,
): Omit<FileProgress, "offset" | "nextSeq" | "sessionId"> {
  const startedAt =
    progress && new Date(progress.startedAt) < new Date(aggregate.startedAt) ? progress.startedAt : aggregate.startedAt;
  const endedAt =
    progress && new Date(progress.endedAt) > new Date(aggregate.endedAt) ? progress.endedAt : aggregate.endedAt;

  return {
    model: aggregate.model || progress?.model || "",
    turnCount: (progress?.turnCount ?? 0) + aggregate.turnCount,
    messageCount: (progress?.messageCount ?? 0) + aggregate.messageCount,
    toolCallCount: (progress?.toolCallCount ?? 0) + aggregate.toolCallCount,
    toolNames: [...new Set([...(progress?.toolNames ?? []), ...aggregate.toolNames])],
    touchedFiles: [...new Set([...(progress?.touchedFiles ?? []), ...aggregate.touchedFiles])],
    startedAt,
    endedAt,
  };
}
