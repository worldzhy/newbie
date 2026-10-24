import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface CollectorWorkspaceConfig {
  /** Stable identifier the server stores (e.g. the repository directory name). */
  workspaceKey: string;
  /** Absolute path of the workspace root. */
  rootPath: string;
  /** Self-declared company/personal split. Only company workspaces are scanned. */
  isCompany: boolean;
  /** Workspace → repository mapping reported to the server. */
  repositories: { path: string; platform: string; repositoryFullName: string }[];
}

/**
 * IDE identity: both the key of `agentSessionDirectories` and the key of the
 * session source registry. The wire provenance may differ per IDE (Trae only
 * exposes IDE-written summaries, reported as "trae-memory").
 */
export type IdeKey = "claude" | "codex" | "trae";

export interface CollectorConfig {
  endpoint: string;
  token: string;
  memberUserId: string;
  workspaces: CollectorWorkspaceConfig[];
  /**
   * Where each IDE keeps its agent session records, keyed by IDE and scanned
   * recursively. Only sessions whose recorded working directory is inside a
   * company workspace are uploaded. `trae` points at Trae's memory store
   * (~/.trae-cn/memory/projects) — those sessions are the IDE's own summaries,
   * uploaded with source "trae-memory".
   */
  agentSessionDirectories: Partial<Record<IdeKey, string>>;
  /** Directories inside company workspaces whose markdown files count as declared work. */
  documentDirectories: string[];
  maxDocumentBytes: number;
}

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

export interface CollectorState {
  files: Record<string, FileProgress>;
  documents: Record<string, { hash: string; workspaceKey: string }>;
}

export const DEFAULT_CONFIG_PATH = join(homedir(), ".devbie", "people-collector.json");
export const DEFAULT_STATE_PATH = join(homedir(), ".devbie", "people-collector-state.json");

/** Default agent session directories per IDE, probed for existence at init time. */
export const DEFAULT_AGENT_SESSION_DIRECTORIES: Record<IdeKey, string> = {
  claude: join(homedir(), ".claude", "projects"),
  codex: join(homedir(), ".codex", "sessions"),
  trae: join(homedir(), ".trae-cn", "memory", "projects"),
};

/** The member profile downloaded from the server — everything init needs. */
export interface CollectorProfile {
  endpoint: string;
  token: string;
  memberUserId: string;
}

export function loadConfig(path = DEFAULT_CONFIG_PATH): CollectorConfig {
  if (!existsSync(path)) {
    throw new Error(`Collector config not found at ${path}. Run "people-work-collector init" first.`);
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<CollectorConfig>;
  const config: CollectorConfig = {
    endpoint: (parsed.endpoint ?? "").replace(/\/$/, ""),
    token: parsed.token ?? "",
    memberUserId: parsed.memberUserId ?? "",
    workspaces: parsed.workspaces ?? [],
    agentSessionDirectories: parsed.agentSessionDirectories ?? {},
    documentDirectories: parsed.documentDirectories ?? [],
    maxDocumentBytes: parsed.maxDocumentBytes ?? 200_000,
  };
  if (!config.endpoint || !config.token || !config.memberUserId) {
    throw new Error("Collector config must define endpoint, token and memberUserId.");
  }
  return config;
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

export function writeSampleConfig(path = DEFAULT_CONFIG_PATH): void {
  const sample: CollectorConfig = {
    endpoint: "http://localhost:3000",
    token: "<collector token from the supervisor>",
    memberUserId: "<your userId uuid>",
    workspaces: [
      {
        workspaceKey: "nightwatch-backend",
        rootPath: join(homedir(), "src", "nightwatch-backend"),
        isCompany: true,
        repositories: [{ path: ".", platform: "github", repositoryFullName: "worldzhy/nightwatch-backend" }],
      },
    ],
    agentSessionDirectories: { ...DEFAULT_AGENT_SESSION_DIRECTORIES },
    documentDirectories: ["docs", ".trae/documents"],
    maxDocumentBytes: 200_000,
  };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(sample, null, 2), "utf8");
}

/**
 * Writes a ready-to-run config from a downloaded profile: credentials come
 * from the profile, session sources are probed (only roots that exist on this
 * machine are kept), workspaces start empty — the member fills in which of
 * their workspaces are company ones before the first sync.
 */
export function writeConfigFromProfile(profile: CollectorProfile, path = DEFAULT_CONFIG_PATH): void {
  if (!profile.endpoint || !profile.token || !profile.memberUserId) {
    throw new Error("Profile must define endpoint, token and memberUserId.");
  }
  const agentSessionDirectories: Partial<Record<IdeKey, string>> = {};
  for (const ide of Object.keys(DEFAULT_AGENT_SESSION_DIRECTORIES) as IdeKey[]) {
    const root = DEFAULT_AGENT_SESSION_DIRECTORIES[ide];
    if (existsSync(root)) agentSessionDirectories[ide] = root;
  }
  const config: CollectorConfig = {
    endpoint: profile.endpoint.replace(/\/$/, ""),
    token: profile.token,
    memberUserId: profile.memberUserId,
    workspaces: [],
    agentSessionDirectories,
    documentDirectories: ["docs", ".trae/documents"],
    maxDocumentBytes: 200_000,
  };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2), "utf8");
}
