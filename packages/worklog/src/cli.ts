#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { syncOnce } from "./sync";
import { DEFAULT_CONFIG_PATH, DEFAULT_STATE_PATH, loadConfig, saveConfig } from "./config";
import { upsertConfigFromProfile } from "./profile";
import type { WorklogProfile } from "./profile";
import { loadState, saveState } from "./state";
import { addWorkspace, removeWorkspace } from "./workspaces";
import { WorklogApi } from "./api";

const USAGE = `Use:
  worklog [--profile <path>]   apply the downloaded profile (install or rotate credentials), then sync
  worklog add <path>           declare a workspace — only declared paths are ever scanned
  worklog remove <path>        stop scanning a workspace
  worklog status               show what is configured and what has been sent`;

/**
 * `worklog` — the member-side worklog agent (ADR-027). The default action is
 * sync; workspaces are declared with `add`/`remove` against the local config.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "add" || command === "remove") {
    const rawPath = args[1];
    if (!rawPath || args.length > 2) {
      console.error(USAGE);
      process.exit(1);
    }
    const config = loadConfig();
    if (command === "add") {
      const result = addWorkspace(config, rawPath);
      saveConfig(config);
      const { workspace } = result;
      console.log(
        result.alreadyDeclared
          ? `Already declared: ${workspace.workspaceKey} (${workspace.rootPath})`
          : `Declared workspace "${workspace.workspaceKey}" → ${workspace.rootPath}`,
      );
      for (const entry of result.activity) {
        if (entry.sessions > 0) console.log(`  ${entry.ide}: ${entry.sessions} session(s) found`);
      }
      for (const warning of result.warnings) console.log(`warning: ${warning}`);
      if (!result.alreadyDeclared) console.log("It will be reported on the next sync.");
    } else {
      const removed = removeWorkspace(config, rawPath);
      saveConfig(config);
      console.log(
        `Removed workspace "${removed.workspaceKey}" (${removed.rootPath}) — the next sync reports nothing more for it.`,
      );
    }
    return;
  }

  if (command === "status") {
    const config = loadConfig();
    const state = loadState();
    console.log(`Config:  ${DEFAULT_CONFIG_PATH}`);
    console.log(`State:   ${DEFAULT_STATE_PATH}`);
    console.log(`Server:  ${config.endpoint}`);
    console.log(`Member:  ${config.memberUserId}`);
    console.log("Workspaces (allowlist — only these are scanned):");
    for (const workspace of config.workspaces) {
      console.log(`  - ${workspace.workspaceKey} ${workspace.rootPath}`);
    }
    if (config.workspaces.length === 0) {
      console.log("  (none yet — declare one with: worklog add <path>)");
    }
    console.log(`Tracked session files: ${Object.keys(state.files).length}`);
    console.log(`Tracked documents:     ${Object.keys(state.documents).length}`);
    return;
  }

  const profileFlag = args.indexOf("--profile");
  const profilePath = profileFlag !== -1 ? args[profileFlag + 1] : undefined;
  if (args.some((arg, index) => arg !== "--profile" && index !== profileFlag + 1)) {
    console.error(USAGE);
    process.exit(1);
  }

  if (profilePath) {
    const profile = JSON.parse(readFileSync(profilePath, "utf8")) as WorklogProfile;
    upsertConfigFromProfile(profile);
    console.log(`Configured from ${profilePath}. Declare your workspaces with: worklog add <path>`);
  }

  const config = loadConfig();
  const state = loadState();
  const api = new WorklogApi(config.endpoint, config.token);

  const summary = await syncOnce(config, state, api);
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
