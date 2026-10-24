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

export const DEFAULT_CONFIG_PATH = join(homedir(), ".devbie", "people-collector.json");
export const DEFAULT_STATE_PATH = join(homedir(), ".devbie", "people-collector-state.json");

/** Default agent session directories per IDE, probed for existence at init time. */
export const DEFAULT_AGENT_SESSION_DIRECTORIES: Record<IdeKey, string> = {
  claude: join(homedir(), ".claude", "projects"),
  codex: join(homedir(), ".codex", "sessions"),
  trae: join(homedir(), ".trae-cn", "memory", "projects"),
};

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
