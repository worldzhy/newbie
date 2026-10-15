import type { Response } from "express";

/** Interval between SSE keepalive comment lines. */
export const SSE_KEEPALIVE_MS = 15_000;

/**
 * Sets the standard SSE response headers and flushes them immediately so the
 * client starts receiving bytes before the first event is produced.
 */
export function sseHeaders(res: Response): void {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Prevent nginx/proxy buffering so events (and keepalive comments) flush live.
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

/**
 * Writes one SSE event frame. No-ops once the socket is gone so late emissions
 * from an aborted pipeline never throw on a closed stream.
 */
export function writeSseEvent(res: Response, event: string, data: unknown): void {
  if (res.destroyed || res.writableEnded) return;
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** Writes an SSE comment line; clients ignore it, intermediaries stay alive. */
export function writeSseKeepalive(res: Response): void {
  if (res.destroyed || res.writableEnded) return;
  res.write(": keepalive\n\n");
}

/** Handle returned by bindSseAbort. */
export interface SseAbortBinding {
  /** Signal to hand to the streaming pipeline. */
  readonly signal: AbortSignal;
  /**
   * Marks the stream as ended normally and detaches the close listener. Call
   * it in the controller's finally block before res.end(): a normal end()
   * also emits "close" and must not be mistaken for a client disconnect.
   */
  settle(): void;
}

/**
 * Wires an AbortController to the response "close" event so a client
 * disconnect (e.g. a Stop button) aborts the whole streaming pipeline instead
 * of spending model tokens and queries on a dead connection. The optional
 * onClientDisconnect callback runs once, only on a premature close.
 */
export function bindSseAbort(res: Response, onClientDisconnect?: () => void): SseAbortBinding {
  const abortController = new AbortController();
  let settled = false;
  const onClientClose = (): void => {
    // A normal end() also emits close, but `settled` is already true by then.
    if (!settled && !abortController.signal.aborted) {
      onClientDisconnect?.();
      abortController.abort();
    }
  };
  res.on("close", onClientClose);
  return {
    signal: abortController.signal,
    settle(): void {
      settled = true;
      res.off("close", onClientClose);
    },
  };
}
