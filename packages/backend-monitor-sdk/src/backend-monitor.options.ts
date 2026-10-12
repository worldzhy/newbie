import { hostname } from "node:os";
import type { BackendMonitorOptions, ResolvedBackendMonitorOptions } from "./backend-monitor.types";

/**
 * Applies defaults to public BackendMonitorOptions. Shared by the Nest
 * DynamicModule adapter and the function-style bootstrap entry
 * (startBackendMonitoring) so the two wiring paths cannot drift.
 */
export function resolveBackendMonitorOptions(options: BackendMonitorOptions): ResolvedBackendMonitorOptions {
  return {
    endpoint: options.endpoint,
    token: options.token,
    env: options.env ?? process.env.ENVIRONMENT ?? "",
    appVersion: options.appVersion ?? "",
    instanceId: options.instanceId ?? hostname(),
    flushIntervalMs: options.flushIntervalMs ?? 5000,
    maxBatchSize: options.maxBatchSize ?? 500,
    maxQueueSize: options.maxQueueSize ?? 2000,
  };
}
