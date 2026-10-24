#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

import { collectOnce } from "./collect";
import { DEFAULT_CONFIG_PATH, DEFAULT_STATE_PATH, loadConfig, writeSampleConfig } from "./config";
import { writeConfigFromProfile } from "./profile";
import type { CollectorProfile } from "./profile";
import { loadState, saveState } from "./state";
import { CollectorApi } from "./api";

/**
 * `people-work-collector` — member-side evidence collector (ADR-029 §8).
 *
 * Commands:
 *   init [--profile <path>]  write ~/.devbie/people-collector.json — from a
 *                            downloaded profile (endpoint/token/userId) when
 *                            given, a fill-in sample otherwise
 *   sync                     report workspaces, new agent-session chunks and changed declared documents
 *   status                   show what is configured and what has already been sent
 */
async function main(): Promise<void> {
  const command = process.argv[2] ?? "sync";

  if (command === "init") {
    if (existsSync(DEFAULT_CONFIG_PATH)) {
      console.log(`Config already exists at ${DEFAULT_CONFIG_PATH}`);
      return;
    }
    const profileFlag = process.argv.indexOf("--profile");
    const profilePath = profileFlag !== -1 ? process.argv[profileFlag + 1] : undefined;
    if (profilePath) {
      const profile = JSON.parse(readFileSync(profilePath, "utf8")) as CollectorProfile;
      writeConfigFromProfile(profile);
      console.log(
        `Wrote config to ${DEFAULT_CONFIG_PATH} from ${profilePath}. Add your company workspaces to "workspaces" before the first sync.`,
      );
      return;
    }
    writeSampleConfig();
    console.log(`Wrote sample config to ${DEFAULT_CONFIG_PATH}. Fill in token, memberUserId and workspace paths.`);
    return;
  }

  if (command === "status") {
    const config = loadConfig();
    const state = loadState();
    console.log(`Config:  ${DEFAULT_CONFIG_PATH}`);
    console.log(`State:   ${DEFAULT_STATE_PATH}`);
    console.log(`Server:  ${config.endpoint}`);
    console.log(`Member:  ${config.memberUserId}`);
    console.log("Workspaces:");
    for (const workspace of config.workspaces) {
      console.log(
        `  - ${workspace.workspaceKey} (${workspace.isCompany ? "company" : "personal"}) ${workspace.rootPath}`,
      );
    }
    console.log(`Tracked session files: ${Object.keys(state.files).length}`);
    console.log(`Tracked documents:     ${Object.keys(state.documents).length}`);
    return;
  }

  if (command !== "sync") {
    console.error(`Unknown command "${command}". Use: init | sync | status`);
    process.exit(1);
  }

  const config = loadConfig();
  const state = loadState();
  const api = new CollectorApi(config.endpoint, config.token);

  const summary = await collectOnce(config, state, api);
  saveState(state);

  console.log(
    `Workspaces ${summary.workspacesReported}, sessions ${summary.sessionsUploaded} (${summary.messagesUploaded} messages), documents ${summary.documentsUploaded}, skipped ${summary.skippedSessions}.`,
  );
  for (const note of summary.notes) console.log(`note: ${note}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
