import type { WorklogWorkspaceConfig } from "../config";

export type MessageRole = "user" | "assistant" | "tool" | "system";

export interface NormalizedMessage {
  seq: number;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolCalls?: string;
  tokenCount?: number;
  createdAt?: string;
}

export interface SessionAggregate {
  externalSessionId: string;
  model: string;
  turnCount: number;
  messageCount: number;
  toolCallCount: number;
  toolNames: string[];
  touchedFiles: string[];
  startedAt: string;
  endedAt: string;
}

export interface ParsedSessionFile {
  /** Working directory recorded by the IDE — used for company-workspace scoping. */
  workspaceRootPath: string | null;
  externalSessionId: string | null;
  messages: NormalizedMessage[];
  aggregate: SessionAggregate;
}

/** What one incremental read produced: the parsed delta plus the offset to resume from. */
export interface SessionDelta {
  parsed: ParsedSessionFile;
  nextOffset: number;
}

/** One source line after format normalization, before it is chunked into messages. */
export interface NormalizedRecord {
  role: MessageRole;
  content: string;
  model?: string;
  toolNames: string[];
  toolCalls: { name: string; filePath?: string; input?: unknown }[];
}

/** Everything a source needs in order to place one file in a declared workspace. */
export interface SessionFileContext {
  filePath: string;
  /** Directory configured for this IDE (e.g. ~/.claude/projects). */
  directory: string;
  parsed: ParsedSessionFile;
  companyWorkspaces: WorklogWorkspaceConfig[];
}

/**
 * One IDE's session storage. A source owns the three things that differ per
 * IDE — which files it reads, how a delta is parsed, and how a file maps to a
 * declared workspace. Worklog therefore carries no per-IDE branching.
 */
export interface SessionSource {
  /** Wire value reported to the server as session provenance. */
  provenance: string;
  accepts(filePath: string): boolean;
  readDelta(filePath: string, offset: number, nextSeq: number): SessionDelta;
  resolveWorkspace(context: SessionFileContext): WorklogWorkspaceConfig | null;
  /** Caveat surfaced in the run summary; only sources with a caveat declare one. */
  note?: string;
}

export function emptySession(): ParsedSessionFile {
  const now = new Date().toISOString();
  return {
    workspaceRootPath: null,
    externalSessionId: null,
    messages: [],
    aggregate: {
      externalSessionId: "",
      model: "",
      turnCount: 0,
      messageCount: 0,
      toolCallCount: 0,
      toolNames: [],
      touchedFiles: [],
      startedAt: now,
      endedAt: now,
    },
  };
}
