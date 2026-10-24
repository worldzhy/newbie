import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { DEFAULT_AGENT_SESSION_DIRECTORIES, DEFAULT_CONFIG_PATH } from "./config";
import type { WorklogConfig, IdeKey } from "./config";

/** The member profile downloaded from the server — everything init needs. */
export interface WorklogProfile {
  endpoint: string;
  token: string;
  memberUserId: string;
}

/**
 * Writes a ready-to-run config from a downloaded profile: credentials come
 * from the profile, IDE session directories are probed (only the ones that
 * exist on this machine are kept), workspaces start empty — the member fills
 * in which of their workspaces are company ones before the first sync.
 */
export function writeConfigFromProfile(profile: WorklogProfile, path = DEFAULT_CONFIG_PATH): void {
  if (!profile.endpoint || !profile.token || !profile.memberUserId) {
    throw new Error("Profile must define endpoint, token and memberUserId.");
  }
  const agentSessionDirectories: Partial<Record<IdeKey, string>> = {};
  for (const ide of Object.keys(DEFAULT_AGENT_SESSION_DIRECTORIES) as IdeKey[]) {
    const directory = DEFAULT_AGENT_SESSION_DIRECTORIES[ide];
    if (existsSync(directory)) agentSessionDirectories[ide] = directory;
  }
  const config: WorklogConfig = {
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
