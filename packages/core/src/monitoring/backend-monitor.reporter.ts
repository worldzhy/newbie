import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {
  IngestPayload,
  MonitoredErrorEvent,
  MonitoredRequestEvent,
  ResolvedBackendMonitorOptions,
} from "./backend-monitor.types";

type QueueItem =
  | { kind: "request"; payload: MonitoredRequestEvent }
  | { kind: "error"; payload: MonitoredErrorEvent };

/**
 * Transport abstraction; the default posts to
 * {endpoint}/backend-monitor/ingest. Injected in tests with a fake function.
 */
export type MonitorTransport = (payload: IngestPayload) => Promise<void>;

/**
 * In-memory batching buffer for monitor events.
 *
 * Events are collected into one bounded queue and shipped as a single ingest
 * payload per flush (both kinds share one HTTP call). The queue is bounded:
 * under overflow NEW events are dropped (counted) so monitoring can never
 * exhaust host memory. Delivery is fire-and-forget — failed batches are
 * dropped (logged at warn) and never block or crash the host application.
 */
export class MonitorEventReporter implements OnModuleInit, OnModuleDestroy {
  private queue: QueueItem[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  /** Total events discarded because the queue was full. */
  droppedCount = 0;
  /** Total batches abandoned after a transport failure. */
  failedBatchCount = 0;

  private readonly logger = new Logger("BackendMonitor");

  constructor(
    private readonly options: ResolvedBackendMonitorOptions,
    private readonly transport?: MonitorTransport,
  ) {}

  /** Starts the periodic flush timer. Called by Nest lifecycle. */
  onModuleInit(): void {
    this.start();
  }

  /** Stops the timer. Called by Nest lifecycle on shutdown. */
  onModuleDestroy(): void {
    this.stop();
  }

  /** Starts the periodic flush timer. */
  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.flush();
    }, this.options.flushIntervalMs);
    // Do not keep the process alive just for monitoring flushes.
    this.timer.unref?.();
    // Best-effort drain when the event loop empties. May not complete (e.g. on
    // a hard kill); it must never throw and must never block exit.
    process.once("beforeExit", () => {
      void this.flush();
    });
  }

  /** Stops the timer. */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Enqueues a request event; drops it when the queue is full. */
  enqueueRequest(event: MonitoredRequestEvent): void {
    this.enqueue({ kind: "request", payload: event });
  }

  /** Enqueues an error event; drops it when the queue is full. */
  enqueueError(event: MonitoredErrorEvent): void {
    this.enqueue({ kind: "error", payload: event });
  }

  /** Current queue length (observability/test helper). */
  get pendingCount(): number {
    return this.queue.length;
  }

  private enqueue(item: QueueItem): void {
    if (this.queue.length >= this.options.maxQueueSize) {
      this.droppedCount += 1;
      return;
    }
    this.queue.push(item);
    // Ship immediately once either kind reaches the batch cap.
    if (
      this.countByKind("request") >= this.options.maxBatchSize ||
      this.countByKind("error") >= this.options.maxBatchSize
    ) {
      void this.flush();
    }
  }

  private countByKind(kind: QueueItem["kind"]): number {
    let count = 0;
    for (const item of this.queue) if (item.kind === kind) count += 1;
    return count;
  }

  /**
   * Splits at most maxBatchSize events of each kind off the queue, preserving
   * arrival order. Overflow events stay queued for the next flush.
   */
  takeBatch(): IngestPayload | null {
    if (this.queue.length === 0) return null;
    const requests: MonitoredRequestEvent[] = [];
    const errors: MonitoredErrorEvent[] = [];
    const remainder: QueueItem[] = [];

    for (const item of this.queue) {
      const target = item.kind === "request" ? requests : errors;
      if (target.length < this.options.maxBatchSize) {
        target.push(
          item.payload as MonitoredRequestEvent & MonitoredErrorEvent,
        );
      } else {
        remainder.push(item);
      }
    }
    this.queue = remainder;

    if (requests.length === 0 && errors.length === 0) return null;
    return {
      env: this.options.env,
      instanceId: this.options.instanceId,
      appVersion: this.options.appVersion,
      requests,
      errors,
    };
  }

  /**
   * Ships one batch. Overlapping calls are skipped (the next interval picks up
   * leftovers). A failed transport drops the batch silently after a warning;
   * events must never be retried back into the queue (a hard-down platform
   * would make it grow unbounded).
   */
  async flush(): Promise<void> {
    if (this.flushing) return;
    const batch = this.takeBatch();
    if (!batch) return;

    this.flushing = true;
    try {
      const send = this.transport ?? this.defaultTransport;
      await send(batch);
    } catch (error) {
      this.failedBatchCount += 1;
      this.logger.warn(
        `Dropped backend monitor batch (requests=${batch.requests.length}, errors=${batch.errors.length}): ${
          (error as Error)?.message ?? error
        }`,
      );
    } finally {
      this.flushing = false;
    }

    // More events remained because one kind exceeded the cap; flush again.
    if (this.queue.length > 0) await this.flush();
  }

  /** Real network transport used outside tests. */
  private defaultTransport: MonitorTransport = async (payload) => {
    await fetch(
      `${this.options.endpoint.replace(/\/+$/, "")}/backend-monitor/ingest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Application-Token": this.options.token,
          // Loop guard: the server-side probe skips inbound requests tagged with
          // this header so the ingest call is never reported about itself.
          "X-Backend-Monitor": "1",
        },
        body: JSON.stringify(payload),
      },
    );
  };
}
