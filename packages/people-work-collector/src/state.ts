import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { DEFAULT_STATE_PATH } from "./config";
import type { SessionAggregate } from "./sessions/types";

/** How far one session file has been read, and what it has already contributed. */
export interface FileProgress {
  offset: number;
  nextSeq: number;
  sessionId: string;
  turnCount: number;
  messageCount: number;
  toolCallCount: number;
  startedAt: string;
  endedAt: string;
  model: string;
  toolNames: string[];
  touchedFiles: string[];
}

/** Everything already sent for this installation, so a sync only reads the tail. */
export interface CollectorState {
  files: Record<string, FileProgress>;
  documents: Record<string, { hash: string; workspaceKey: string }>;
}

export function loadState(path = DEFAULT_STATE_PATH): CollectorState {
  if (!existsSync(path)) return { files: {}, documents: {} };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<CollectorState>;
    return { files: parsed.files ?? {}, documents: parsed.documents ?? {} };
  } catch {
    return { files: {}, documents: {} };
  }
}

export function saveState(state: CollectorState, path = DEFAULT_STATE_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}

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
