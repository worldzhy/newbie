import { Request } from "express";

/** Per-request probe metadata attached to the Express request object. */
export interface MonitorRequestMeta {
  requestId: string;
  startDate: Date;
}

const META_KEY = Symbol.for("@devbie/newbie:backend-monitor:meta");

/** Ingest path; traffic on it is the probe's own and must never be recorded. */
export const INGEST_PATH = "/backend-monitor/ingest";

/** Loop-guard header set by the reporter on every outgoing ingest call. */
export const LOOP_GUARD_HEADER = "x-backend-monitor";

/** Attaches probe metadata to the request. */
export function setMonitorMeta(
  request: Request,
  meta: MonitorRequestMeta,
): void {
  Object.defineProperty(request, META_KEY, {
    value: meta,
    enumerable: false,
    writable: false,
    configurable: false,
  });
}

/** Reads probe metadata; undefined for skipped (loop) requests. */
export function getMonitorMeta(
  request: Request,
): MonitorRequestMeta | undefined {
  return (request as unknown as Record<symbol, unknown>)[META_KEY] as
    | MonitorRequestMeta
    | undefined;
}

/**
 * Whether the inbound request is part of the monitoring pipeline itself:
 * either explicitly tagged by an outgoing reporter call, or hitting the
 * ingest path directly. Recording either would self-amplify traffic.
 */
export function isMonitoringTraffic(request: Request): boolean {
  if (request.headers[LOOP_GUARD_HEADER]) return true;
  // originalUrl is stable across nested router mounts, unlike req.path.
  const pathname = safePathname(request);
  return pathname === INGEST_PATH || pathname.startsWith(`${INGEST_PATH}/`);
}

/**
 * Pathname without query string. Uses originalUrl rather than Express's
 * req.path: Nest mounts consumer middleware on an inner router, where req.path
 * is temporarily rewritten relative to the mount point when the middleware
 * runs. originalUrl stays equal to the full, unrewritten request URL for the
 * whole lifetime of the request. Query strings may carry tokens or phone
 * numbers and must never leave the process.
 */
export function safePathname(request: Request): string {
  return (request.originalUrl ?? request.url ?? "").split("?")[0];
}

/**
 * Express route template, e.g. /users/:id. Empty string for unmatched routes
 * (404s). Combines the mount base with the matched route pattern.
 */
export function routeTemplate(request: Request): string {
  const pattern = (request.route?.path as string | undefined) ?? "";
  return `${request.baseUrl ?? ""}${pattern}`;
}
