/** A single health indicator result entry. */
export interface HealthIndicatorEntry {
  /** "up" = healthy, "down" = unhealthy. */
  status: "up" | "down";
  /** Optional human-readable message (error detail, readyState, etc.). */
  message?: string;
}

/** Aggregated result of a full health check run. */
export interface HealthCheckResult {
  /** "ok" = all indicators up, "error" = at least one down. */
  status: "ok" | "error";
  /** Per-indicator results, keyed by indicator name. */
  info: Record<string, HealthIndicatorEntry>;
}

/** A named indicator: runs a check and returns its entry. */
export interface NamedHealthIndicator {
  /** Display key in the health snapshot (e.g. "prisma", "mongo"). */
  readonly name: string;
  /** Async check that returns the entry for this indicator. */
  readonly check: () => Promise<HealthIndicatorEntry>;
}

/** Factory that wraps a resolved service instance into a NamedHealthIndicator. */
export type HealthIndicatorFactory = (service: unknown) => NamedHealthIndicator;

/** A known indicator definition: scan the DI container for a service by
 * constructor name and wrap it with the given factory. */
export interface KnownIndicator {
  /** The constructor/class name to look for in the DI container. */
  readonly name: string;
  /** Factory that creates a health indicator from the resolved instance. */
  readonly factory: HealthIndicatorFactory;
}

/** Minimal NestJS application context type needed by the health SDK.
 * The real INestApplicationContext exposes its DI container as a protected
 * member, which is not visible to TypeScript's structural typing. We accept
 * any object and access the container at runtime via a cast. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type NestAppLike = object;

/** Configuration for startHealthReporting. */
export interface HealthReportingOptions {
  /** Server endpoint to POST health snapshots to. Empty/undefined → skip
   * reporting but still run checks (useful for local debugging). */
  endpoint?: string;
  /** Installation token sent as X-Health-Token header. */
  token?: string;
  /** Reporting interval in milliseconds. Defaults to 30000. */
  intervalMs?: number;
  /** Initial delay before the first report, giving dependencies time to
   * connect. Defaults to 10000. */
  initialDelayMs?: number;
  /** Deployed application version (git sha / semver), self-reported. */
  appVersion?: string;
  /** Self-reported deployment environment, e.g. "prod". */
  env?: string;
  /** Self-reported instance identifier (hostname, EC2 instance id, ...). */
  instanceId?: string;
}

/** Handle returned by startHealthReporting for lifecycle control. */
export interface HealthReportingHandle {
  /** Stop the reporting loop. */
  stop(): void;
}
