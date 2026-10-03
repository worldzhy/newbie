import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cyan, green, red, yellow } from "colorette";

import { moduleKeys } from "../core/modules-state";
import { CliError } from "../lib/errors";
import { execCapture } from "../lib/exec";
import { readModulesState } from "../lib/modules-state";
import { REGISTRY_REF_ENV } from "../lib/registry";
import { CLI_VERSION } from "../lib/version";

import { runApply } from "./apply";
import { collectStatus, StatusReport } from "./status";
import { GlobalOptions } from "./shared";
import { runUpdate } from "./update";

const ENDPOINT_ENV = "MODULE_HUB_ENDPOINT";
const TOKEN_ENV = "MODULE_HUB_TOKEN";
const DEFAULT_POLL_INTERVAL_SECONDS = 60;

type HubChangeType = "ADD" | "REMOVE" | "UPGRADE";
type HubDriftPolicy = "reject" | "force";

interface HubPendingChange {
  id: string;
  type: HubChangeType;
  moduleKey: string;
  targetSourceCommit?: string;
  driftPolicy: HubDriftPolicy;
  delivery: "worktree" | "pr";
}

interface HubPollResponse {
  serverTime: string;
  pollIntervalSeconds?: number;
  latestRegistrySourceCommit?: string;
  pendingChanges: HubPendingChange[];
}

interface ChangeReceipt {
  changeRequestId: string;
  outcome: "DONE" | "FAILED";
  summary?: Record<string, unknown>;
  error?: string;
}

class HubHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postPoll(endpoint: string, token: string, body: Record<string, unknown>): Promise<HubPollResponse> {
  const url = `${endpoint}/module-hub/agent/poll`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-module-hub-token": token,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new CliError(`Cannot reach module hub at ${url}: ${(error as Error).message}`);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new HubHttpError(response.status, `Hub poll failed with HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new CliError(`Hub poll returned invalid JSON: ${text.slice(0, 500)}`);
  }
  // Hosts built on @devbie/newbie wrap responses in {code, error, data}
  // (HttpResponseInterceptor); unwrap the envelope when present.
  const payload =
    parsed && typeof parsed === "object" && "data" in parsed && "code" in parsed
      ? (parsed as { data: unknown }).data
      : parsed;
  return payload as HubPollResponse;
}

/**
 * Working-tree change summary for the receipt. `git status --porcelain` is
 * used instead of `git diff --name-status` so that files newly added by an
 * ADD change (untracked) are included. Returns null outside a git repository.
 */
async function workingTreeSummary(cwd: string): Promise<string | null> {
  try {
    const result = await execCapture("git", ["status", "--porcelain"], { cwd });
    return result.stdout.trim() || null;
  } catch {
    return null;
  }
}

async function collectReceiptSummary(cwd: string): Promise<Record<string, unknown>> {
  return {
    changedFiles: await workingTreeSummary(cwd),
    status: await collectStatus(cwd),
  };
}

/** ADD/REMOVE: reconcile against the locally computed full target set. */
async function executeSetChange(change: HubPendingChange, options: GlobalOptions): Promise<void> {
  const state = await readModulesState(options.cwd);
  const current = moduleKeys(state);
  const next =
    change.type === "ADD"
      ? [...new Set([...current, change.moduleKey])]
      : current.filter((key) => key !== change.moduleKey);

  const specPath = path.join(os.tmpdir(), `newbie-agent-apply-${change.id}.json`);
  await fs.writeFile(specPath, JSON.stringify({ modules: next }, null, 2), "utf8");
  try {
    await runApply({ ...options, config: specPath, ci: true });
  } finally {
    await fs.rm(specPath, { force: true });
  }
}

/** UPGRADE: pin the registry ref (when given) and update the single module. */
async function executeUpgrade(change: HubPendingChange, options: GlobalOptions): Promise<void> {
  const previousRef = process.env[REGISTRY_REF_ENV];
  if (change.targetSourceCommit) {
    process.env[REGISTRY_REF_ENV] = change.targetSourceCommit;
  } else {
    delete process.env[REGISTRY_REF_ENV];
  }
  try {
    await runUpdate({
      ...options,
      yes: true,
      force: change.driftPolicy === "force",
      keys: [change.moduleKey],
    });
  } finally {
    if (previousRef === undefined) {
      delete process.env[REGISTRY_REF_ENV];
    } else {
      process.env[REGISTRY_REF_ENV] = previousRef;
    }
  }
}

async function executeChange(
  change: HubPendingChange,
  status: StatusReport,
  options: GlobalOptions,
): Promise<ChangeReceipt> {
  console.info(cyan(`\n[agent] Executing ${change.type} ${change.moduleKey} (${change.id})`));

  // Drift gate: refuse to touch a locally modified module unless forced.
  if (change.driftPolicy !== "force") {
    const entry = status.modules.find((module) => module.key === change.moduleKey);
    if (entry?.drift && !entry.drift.clean) {
      return {
        changeRequestId: change.id,
        outcome: "FAILED",
        error: `local drift detected on '${change.moduleKey}' (driftPolicy=reject)`,
      };
    }
  }

  try {
    if (change.type === "UPGRADE") {
      await executeUpgrade(change, options);
    } else {
      await executeSetChange(change, options);
    }
    console.info(green(`[agent] ${change.type} ${change.moduleKey} completed.`));
    return {
      changeRequestId: change.id,
      outcome: "DONE",
      summary: await collectReceiptSummary(options.cwd),
    };
  } catch (error) {
    console.error(red(`[agent] ${change.type} ${change.moduleKey} failed: ${(error as Error).message}`));
    return {
      changeRequestId: change.id,
      outcome: "FAILED",
      error: (error as Error).message,
    };
  }
}

export interface AgentOptions extends GlobalOptions {
  once?: boolean;
}

/**
 * Module-hub agent: an outbound poller that authenticates with
 * MODULE_HUB_ENDPOINT + MODULE_HUB_TOKEN, reports `newbie status` output,
 * executes dispatched change requests through the regular apply/update code
 * paths, and returns execution receipts on the next poll.
 */
export async function runAgent(options: AgentOptions): Promise<void> {
  const endpoint = process.env[ENDPOINT_ENV]?.replace(/\/+$/, "");
  const token = process.env[TOKEN_ENV];

  if (!endpoint || !token) {
    throw new CliError(`Agent requires ${ENDPOINT_ENV} and ${TOKEN_ENV} to be set.`);
  }

  const cwd = path.resolve(options.cwd);
  const agentOptions: GlobalOptions = { ...options, cwd };
  let pollInterval = DEFAULT_POLL_INTERVAL_SECONDS;
  let receipts: ChangeReceipt[] = [];
  let stopped = false;

  const stop = (): void => {
    stopped = true;
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  console.info(cyan(`[agent] Module hub: ${endpoint}`));
  console.info(cyan(`[agent] Mode: ${options.once ? "single pass (--once)" : `daemon (${pollInterval}s interval)`}`));

  while (!stopped) {
    const status = await collectStatus(cwd, { drift: true });

    let response: HubPollResponse;
    try {
      response = await postPoll(endpoint, token, {
        cliVersion: CLI_VERSION,
        status,
        results: receipts,
      });
      receipts = [];
    } catch (error) {
      if (error instanceof HubHttpError && (error.status === 401 || error.status === 403)) {
        throw new CliError(`Hub rejected the installation token (HTTP ${error.status}). The token may be revoked.`);
      }
      if (options.once) throw error;
      console.error(red(`[agent] Poll failed: ${(error as Error).message}; retrying in ${pollInterval}s.`));
      await sleep(pollInterval * 1000);
      continue;
    }

    pollInterval = response.pollIntervalSeconds ?? DEFAULT_POLL_INTERVAL_SECONDS;
    const pending = response.pendingChanges ?? [];

    if (pending.length === 0) {
      if (options.once) {
        console.info(green("\n[agent] No pending changes; single pass complete.\n"));
        return;
      }
      console.info(
        `[agent] ${new Date().toISOString()} idle (registry HEAD: ${response.latestRegistrySourceCommit ?? "unknown"})`,
      );
      await sleep(pollInterval * 1000);
      continue;
    }

    console.info(yellow(`[agent] Received ${pending.length} change request(s).`));
    for (const change of pending) {
      if (change.delivery && change.delivery !== "worktree") {
        receipts.push({
          changeRequestId: change.id,
          outcome: "FAILED",
          error: `delivery '${change.delivery}' is not supported by this CLI version`,
        });
        continue;
      }
      receipts.push(await executeChange(change, status, agentOptions));
    }
    // Loop continues: the next poll delivers the receipts and picks up any
    // follow-up work. In --once mode the loop exits on the first poll that
    // returns an empty pendingChanges list.
    if (options.once && pending.length > 0) {
      console.info(cyan("[agent] Delivering receipts with a final poll..."));
    }
  }

  console.info(yellow("\n[agent] Stopped.\n"));
}
