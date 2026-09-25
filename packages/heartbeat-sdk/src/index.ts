/** Configuration required to start the heartbeat loop. */
export interface HeartbeatOptions {
  /** Nightwatch endpoint prefix (no trailing slash). */
  endpoint: string;
  /** Application UUID assigned by nightwatch. */
  applicationId: string;
  /** Application report token sent as X-Application-Token header. */
  token: string;
  /** Heartbeat interval in milliseconds. Defaults to 30000. */
  intervalMs?: number;
}

/** Handle returned by startHeartbeat for lifecycle control. */
export interface HeartbeatHandle {
  /** Stop the heartbeat loop and release the global singleton. */
  stop(): void;
}

const GLOBAL_KEY = Symbol.for('@devbie/heartbeat-sdk:active');

/**
 * Starts a heartbeat loop that POSTs to
 * `{endpoint}/applications/{applicationId}/heartbeat` immediately and then
 * every `intervalMs` (default 30s).
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

  const {endpoint, applicationId, token, intervalMs = 30_000} = options;
  const url = `${endpoint.replace(/\/+$/, '')}/applications/${applicationId}/heartbeat`;

  async function beat(): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {'X-Application-Token': token},
      });
    } catch {
      // Heartbeat failures are intentionally silent.
    }
  }

  void beat();
  const timer = setInterval(beat, intervalMs);
  if (typeof (timer as {unref?: unknown}).unref === 'function') {
    (timer as {unref(): void}).unref();
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
