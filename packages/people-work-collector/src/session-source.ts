import { readFileSync, statSync } from "node:fs";
import { basename, dirname } from "node:path";

import { redact } from "./redact";

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

const FILE_EDIT_TOOLS = new Set([
  "Edit",
  "Write",
  "MultiEdit",
  "NotebookEdit",
  "edit_file",
  "write_file",
  "apply_patch",
  "create_file",
  "str_replace_editor",
]);

/** Splits long content into bounded chunks so a single row stays compressible. */
const MAX_CHUNK_CHARS = 4_000;

/**
 * Reads newline-delimited transcript lines starting at `offset`.
 * Returns the parsed session delta plus the byte offset after the last
 * complete line — a partially written trailing line is left for the next run.
 */
export function readJsonlDelta(
  filePath: string,
  offset: number,
  nextSeq: number,
): { parsed: ParsedSessionFile; nextOffset: number } {
  const { lines, nextOffset } = readCompleteLines(filePath, offset);
  if (lines.length === 0) {
    return { parsed: emptySession(), nextOffset };
  }

  const messages: NormalizedMessage[] = [];
  const toolNames = new Set<string>();
  const touchedFiles = new Set<string>();
  let workspaceRootPath: string | null = null;
  let externalSessionId: string | null = null;
  let model = "";
  let startedAt: string | null = null;
  let endedAt: string | null = null;
  let turnCount = 0;
  let toolCallCount = 0;
  let seq = nextSeq;

  for (const line of lines) {
    let record: Record<string, unknown>;
    try {
      record = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }

    const cwd = stringOrNull(record.cwd) ?? stringOrNull((record.payload as Record<string, unknown>)?.cwd);
    if (!workspaceRootPath && cwd) workspaceRootPath = cwd;
    const sessionId = stringOrNull(record.sessionId) ?? stringOrNull(record.session_id);
    if (!externalSessionId && sessionId) externalSessionId = sessionId;
    const timestamp = stringOrNull(record.timestamp) ?? stringOrNull(record.created_at);
    if (timestamp) {
      startedAt = startedAt ?? timestamp;
      endedAt = timestamp;
    }

    const normalized = normalizeClaudeRecord(record);
    if (!normalized) continue;
    if (normalized.model) model = normalized.model;
    if (normalized.role === "user") turnCount++;

    for (const call of normalized.toolCalls) {
      toolCallCount++;
      toolNames.add(call.name);
      if (FILE_EDIT_TOOLS.has(call.name) && call.filePath) touchedFiles.add(call.filePath);
    }

    for (const chunk of chunkContent(normalized.content)) {
      messages.push({
        seq: seq++,
        role: normalized.role,
        content: chunk,
        toolName: normalized.toolNames.join(",") || undefined,
        toolCalls: normalized.toolCalls.length > 0 ? JSON.stringify(normalized.toolCalls) : undefined,
        createdAt: timestamp ?? undefined,
      });
    }
  }

  return {
    parsed: {
      workspaceRootPath,
      externalSessionId,
      messages,
      aggregate: {
        externalSessionId: externalSessionId ?? "",
        model,
        turnCount,
        messageCount: messages.length,
        toolCallCount,
        toolNames: [...toolNames],
        touchedFiles: [...touchedFiles],
        startedAt: startedAt ?? new Date().toISOString(),
        endedAt: endedAt ?? new Date().toISOString(),
      },
    },
    nextOffset,
  };
}

interface NormalizedRecord {
  role: MessageRole;
  content: string;
  model?: string;
  toolNames: string[];
  toolCalls: { name: string; filePath?: string; input?: unknown }[];
}

function normalizeClaudeRecord(record: Record<string, unknown>): NormalizedRecord | null {
  const type = stringOrNull(record.type);
  const message = record.message as Record<string, unknown> | undefined;

  if (type === "summary" || type === "system") {
    return null;
  }

  if (!message) {
    // Codex-style records carry the payload one level down.
    return normalizeCodexRecord(record);
  }

  const container = message.content;
  const model = stringOrNull(message.model) ?? undefined;

  if (typeof container === "string") {
    return {
      role: type === "assistant" ? "assistant" : "user",
      content: container,
      model,
      toolNames: [],
      toolCalls: [],
    };
  }

  if (!Array.isArray(container)) return null;

  const texts: string[] = [];
  const toolCalls: { name: string; filePath?: string; input?: unknown }[] = [];
  let role: MessageRole = type === "assistant" ? "assistant" : "user";

  for (const block of container) {
    if (!block || typeof block !== "object") continue;
    const item = block as Record<string, unknown>;
    const blockType = stringOrNull(item.type);

    if (blockType === "text") {
      const text = stringOrNull(item.text);
      if (text) texts.push(text);
    } else if (blockType === "tool_use") {
      const name = stringOrNull(item.name) ?? "unknown";
      const input = item.input as Record<string, unknown> | undefined;
      toolCalls.push({
        name,
        filePath: stringOrNull(input?.["file_path"]) ?? stringOrNull(input?.["path"]) ?? undefined,
        input,
      });
    } else if (blockType === "tool_result") {
      role = "tool";
      const output = item.content;
      if (typeof output === "string") texts.push(output);
      else if (Array.isArray(output)) {
        for (const part of output) {
          if (part && typeof part === "object") {
            const text = stringOrNull((part as Record<string, unknown>).text);
            if (text) texts.push(text);
          }
        }
      }
    }
  }

  if (texts.length === 0 && toolCalls.length === 0) return null;

  return {
    role,
    content: redact(texts.join("\n")),
    model,
    toolNames: toolCalls.map((call) => call.name),
    toolCalls,
  };
}

function normalizeCodexRecord(record: Record<string, unknown>): NormalizedRecord | null {
  const payload = record.payload as Record<string, unknown> | undefined;
  if (!payload) return null;
  const payloadType = stringOrNull(payload.type);
  if (payloadType === "agent_message") {
    const text = stringOrNull(payload.message);
    return text ? { role: "assistant", content: redact(text), toolNames: [], toolCalls: [] } : null;
  }
  if (payloadType === "message") {
    const role = stringOrNull(payload.role) === "assistant" ? "assistant" : "user";
    const content = payload.content;
    const texts: string[] = [];
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part && typeof part === "object") {
          const text =
            stringOrNull((part as Record<string, unknown>).text) ??
            stringOrNull((part as Record<string, unknown>).input_text);
          if (text) texts.push(text);
        }
      }
    } else if (typeof content === "string") {
      texts.push(content);
    }
    return texts.length > 0 ? { role, content: redact(texts.join("\n")), toolNames: [], toolCalls: [] } : null;
  }
  if (payloadType === "function_call") {
    const name = stringOrNull(payload.name) ?? "unknown";
    return { role: "tool", content: "", toolNames: [name], toolCalls: [{ name }] };
  }
  return null;
}

function chunkContent(content: string): string[] {
  if (!content) return [""];
  if (content.length <= MAX_CHUNK_CHARS) return [content];
  const chunks: string[] = [];
  for (let index = 0; index < content.length; index += MAX_CHUNK_CHARS) {
    chunks.push(content.slice(index, index + MAX_CHUNK_CHARS));
  }
  return chunks;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function emptySession(): ParsedSessionFile {
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
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    },
  };
}

/**
 * Trae session memory (`session_memory_*.jsonl` under
 * `~/.trae-cn/memory/projects/<slug>/<yyyymmdd>/`): one line per message,
 * already summarized by the IDE — {intent, actions[], outcome, learned[],
 * message_summary_time, message_id}. This is NOT a raw transcript; the
 * collector marks these sessions with source "trae-memory" so the server
 * never confuses the two fidelity levels. The workspace is derived from the
 * directory slug by the caller — the records carry no cwd.
 */
export function readTraeMemoryDelta(
  filePath: string,
  offset: number,
  nextSeq: number,
): { parsed: ParsedSessionFile; nextOffset: number } {
  const { lines, nextOffset } = readCompleteLines(filePath, offset);
  if (lines.length === 0) {
    return { parsed: emptySession(), nextOffset };
  }

  // Stable session identity: the chat id from the file name plus the daily
  // folder, so the same chat summarized on different days stays distinct.
  const sessionId = basename(filePath, ".jsonl").replace(/^session_memory_/, "");
  const dateFolder = basename(dirname(filePath));
  const externalSessionId = `trae-memory:${dateFolder}:${sessionId}`;

  const messages: NormalizedMessage[] = [];
  let startedAt: string | null = null;
  let endedAt: string | null = null;
  let seq = nextSeq;

  for (const line of lines) {
    let record: Record<string, unknown>;
    try {
      record = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }

    const content = composeTraeMemoryContent(record);
    if (!content) continue;

    const createdAt = parseTraeMemoryTime(stringOrNull(record.message_summary_time));
    if (createdAt) {
      startedAt = startedAt ?? createdAt;
      endedAt = createdAt;
    }

    for (const chunk of chunkContent(redact(content))) {
      messages.push({ seq: seq++, role: "assistant", content: chunk, createdAt: createdAt ?? undefined });
    }
  }

  return {
    parsed: {
      workspaceRootPath: null,
      externalSessionId,
      messages,
      aggregate: {
        externalSessionId,
        model: "",
        turnCount: messages.length,
        messageCount: messages.length,
        toolCallCount: 0,
        toolNames: [],
        touchedFiles: [],
        startedAt: startedAt ?? new Date().toISOString(),
        endedAt: endedAt ?? new Date().toISOString(),
      },
    },
    nextOffset,
  };
}

/** Composes one readable text block out of the IDE's per-message summary. */
function composeTraeMemoryContent(record: Record<string, unknown>): string {
  const parts: string[] = [];
  const intent = stringOrNull(record.intent);
  if (intent) parts.push(`Intent: ${intent}`);
  const actions = stringList(record.actions);
  if (actions.length > 0) parts.push(`Actions: ${actions.join("; ")}`);
  const outcome = stringOrNull(record.outcome);
  if (outcome) parts.push(`Outcome: ${outcome}`);
  const learned = stringList(record.learned);
  if (learned.length > 0) parts.push(`Learned: ${learned.join("; ")}`);
  return parts.join("\n");
}

/** "2026-10-23 00:40:36" is local time — parse it as such, emit ISO. */
function parseTraeMemoryTime(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

/** Complete lines appended after `offset`; a partial trailing line is left for the next run. */
function readCompleteLines(filePath: string, offset: number): { lines: string[]; nextOffset: number } {
  const size = statSync(filePath).size;
  if (size <= offset) return { lines: [], nextOffset: offset };
  const fd = readFileSync(filePath);
  const slice = fd.subarray(offset);
  const lastNewline = slice.lastIndexOf(0x0a);
  if (lastNewline === -1) return { lines: [], nextOffset: offset };
  const text = slice.subarray(0, lastNewline + 1).toString("utf8");
  return { lines: text.split("\n").filter((line) => line.trim()), nextOffset: offset + lastNewline + 1 };
}
