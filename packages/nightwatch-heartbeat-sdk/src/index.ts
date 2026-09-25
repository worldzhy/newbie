/** Configuration required to start the heartbeat loop. */
export interface HeartbeatOptions {
  /** Nightwatch endpoint prefix (no trailing slash). */
  endpoint: string;
  /** Agent token sent as X-Application-Token header; globally unique. */
  token: string;
  /** Heartbeat interval in milliseconds. Defaults to 30000. */
  intervalMs?: number;
}

/** Handle returned by startHeartbeat for lifecycle control. */
export interface HeartbeatHandle {
  /** Stop the heartbeat loop and release the global singleton. */
  stop(): void;
}

const GLOBAL_KEY = Symbol.for("@devbie/nightwatch-heartbeat-sdk:active");

/**
 * Starts a heartbeat loop that POSTs to
 * `{endpoint}/applications/heartbeat` immediately and then every
 * `intervalMs` (default 30s).
 *
 * The agent token is globally unique, so the server resolves the agent
 * from the X-Application-Token header alone; no application id is sent.
 *
 * Idempotent: calling startHeartbeat twice returns the existing handle.
 * The timer is `unref()`-ed so the process can exit naturally.
 * Network failures are silently dropped to avoid crashing the host process.
 */
export function startHeartbeat(options: HeartbeatOptions): HeartbeatHandle {
  const existing = (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
  if (existing) {
    return existing as HeartbeatHandle;
  }

  const { endpoint, token, intervalMs = 30_000 } = options;
  const url = `${endpoint.replace(/\/+$/, "")}/applications/heartbeat`;

  async function beat(): Promise<void> {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "X-Application-Token": token },
      });
    } catch {
      // Heartbeat failures are intentionally silent.
    }
  }

  void beat();
  const timer = setInterval(beat, intervalMs);
  if (typeof (timer as { unref?: unknown }).unref === "function") {
    (timer as { unref(): void }).unref();
  }

  const handle: HeartbeatHandle = {
    stop: () => {
      clearInterval(timer);
      delete (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
    },
  };

  (globalThis as Record<symbol, unknown>)[GLOBAL_KEY] = handle;
  return handle;
}
