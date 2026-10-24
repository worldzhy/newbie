import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { DEFAULT_AGENT_SESSION_DIRECTORIES, DEFAULT_CONFIG_PATH, loadConfig } from "./config";
import type { WorklogConfig, IdeKey } from "./config";

/** The member profile downloaded from the server — everything setup needs. */
export interface WorklogProfile {
  endpoint: string;
  token: string;
  evaluateeUserId: string;
}

/**
 * Applies a downloaded profile to the local config. Credentials always come
 * from the profile (downloading rotates the token, so re-applying is how a
 * rotated installation recovers); everything the member already configured —
 * workspaces, document directories, session directories — is preserved.
 * On first run, IDE session directories are probed (only the ones that exist
 * on this machine are kept) and workspaces start empty — the member fills in
 * which of their workspaces are company ones before the first sync.
 */
export function upsertConfigFromProfile(profile: WorklogProfile, path = DEFAULT_CONFIG_PATH): void {
  if (!profile.endpoint || !profile.token || !profile.evaluateeUserId) {
    throw new Error("Profile must define endpoint, token and evaluateeUserId.");
  }
  const existing = existsSync(path) ? loadConfig(path) : null;
  const agentSessionDirectories: Partial<Record<IdeKey, string>> = {
    ...(existing?.agentSessionDirectories ?? {}),
  };
  for (const ide of Object.keys(DEFAULT_AGENT_SESSION_DIRECTORIES) as IdeKey[]) {
    const directory = DEFAULT_AGENT_SESSION_DIRECTORIES[ide];
    if (!agentSessionDirectories[ide] && existsSync(directory)) agentSessionDirectories[ide] = directory;
  }
  const config: WorklogConfig = {
    endpoint: profile.endpoint.replace(/\/$/, ""),
    token: profile.token,
    evaluateeUserId: profile.evaluateeUserId,
    workspaces: existing?.workspaces ?? [],
    agentSessionDirectories,
    documentDirectories: existing?.documentDirectories ?? ["docs", ".trae/documents"],
    maxDocumentBytes: existing?.maxDocumentBytes ?? 200_000,
  };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2), "utf8");
}
