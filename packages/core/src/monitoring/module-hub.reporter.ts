import { hostname } from "node:os";
import { readModuleSnapshot, type ModuleSnapshotEntry } from "./module-hub.snapshot";

/**
 * Built-in module-hub reporter client.
 *
 * When the process sets `MODULE_HUB_ENDPOINT` + `MODULE_HUB_TOKEN`, this
 * client self-registers with the hub on startup (a `kind="full"` report
 * containing the assembled-module snapshot) and then sends a lightweight
 * `kind="ping"` every `reportIntervalSeconds` (returned by the hub,
 * currently 60s).
 *
 * Design constraints (mirrors `@devbie/nightwatch-heartbeat-sdk`):
 *   - **Idempotent** via a `globalThis[Symbol]` singleton so Next.js HMR or
 *     double-init does not create duplicate timers.
 *   - **Non-blocking**: `setInterval().unref()` keeps the timer from holding
 *     the event loop open; the process exits naturally.
 *   - **Silent failure**: network errors are swallowed — monitoring must
 *     never crash the host application.
 *   - **Non-blocking startup**: the first `full` report is fire-and-forget;
 *     the HTTP server is already accepting traffic before this runs.
 */

// Published package version, read at runtime (package.json sits two levels
// above src/ during development and dist/ in the published tarball).
const VERSION = (require("../../package.json") as { version: string }).version;

/** Timeout for one report HTTP call so a hung hub cannot hold the timer. */
const REPORT_TIMEOUT_MS = 10_000;
/** Default ping interval when the hub response omits reportIntervalSeconds. */
const DEFAULT_PING_INTERVAL_MS = 60_000;

export interface ModuleHubReportOptions {
  /** Hub endpoint prefix (no trailing slash), e.g. https://api.example.com. */
  endpoint: string;
  /** Report token sent as X-Module-Hub-Token header. */
  token: string;
  /** Project root where modules.json lives. Defaults to process.cwd(). */
  projectRoot?: string;
  /** Deployed application version (git sha / semver). Defaults to APP_VERSION env. */
  appVersion?: string;
  /** Self-reported deployment environment. Defaults to ENVIRONMENT env. */
  env?: string;
  /** Self-reported instance identifier. Defaults to os.hostname(). */
  instanceId?: string;
}

/** Handle returned by startModuleHubReporting for lifecycle control. */
export interface ModuleHubReportHandle {
  /** Stop the ping loop and release the global singleton. */
  stop(): void;
}

const GLOBAL_KEY = Symbol.for("@devbie/newbie:module-hub-reporter");

/**
 * Starts the module-hub reporting loop.
 *
 * Immediately sends a `kind="full"` report (with the module snapshot read
 * from `modules.json`), then sends `kind="ping"` every
 * `reportIntervalSeconds` (from the hub response, default 60s).
 *
 * Idempotent: calling twice returns the existing handle. The timer is
 * `unref()`-ed so the process can exit naturally. Network failures are
 * silently dropped to avoid crashing the host process.
 */
export function startModuleHubReporting(options: ModuleHubReportOptions): ModuleHubReportHandle {
  const existing = (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
  if (existing) {
    return existing as ModuleHubReportHandle;
  }

  const { endpoint, token } = options;
  const url = `${endpoint.replace(/\/+$/, "")}/module-hub/report`;
  const projectRoot = options.projectRoot ?? process.cwd();
  const appVersion = options.appVersion ?? process.env.APP_VERSION ?? "";
  const env = options.env ?? process.env.ENVIRONMENT ?? "";
  const instanceId = options.instanceId ?? hostname();

  let pingIntervalMs = DEFAULT_PING_INTERVAL_MS;
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  async function send(body: Record<string, unknown>): Promise<{ reportIntervalSeconds?: number } | null> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Module-Hub-Token": token,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
      });
      if (!response.ok) return null;
      return (await response.json()) as { reportIntervalSeconds?: number };
    } catch {
      // Report failures are intentionally silent.
      return null;
    }
  }

  async function reportFull(): Promise<void> {
    let modules: ModuleSnapshotEntry[] = [];
    try {
      modules = await readModuleSnapshot(projectRoot);
    } catch {
      // modules.json read failed; report without a snapshot.
    }

    const response = await send({
      kind: "full",
      framework: "newbie",
      frameworkVersion: `newbie@${VERSION}`,
      appVersion,
      env,
      instanceId,
      modules,
    });

    if (response?.reportIntervalSeconds) {
      pingIntervalMs = response.reportIntervalSeconds * 1000;
    }

    // Start the ping loop now that we know the interval (or the default).
    if (!stopped && !timer) {
      timer = setInterval(() => {
        void send({ kind: "ping" });
      }, pingIntervalMs);
      if (typeof (timer as { unref?: unknown }).unref === "function") {
        (timer as { unref(): void }).unref();
      }
    }
  }

  // Fire the first full report immediately (async, fire-and-forget).
  void reportFull();

  const handle: ModuleHubReportHandle = {
    stop: () => {
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      delete (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
    },
  };

  (globalThis as Record<symbol, unknown>)[GLOBAL_KEY] = handle;
  return handle;
}
