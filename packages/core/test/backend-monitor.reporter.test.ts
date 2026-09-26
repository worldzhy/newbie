import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MonitorEventReporter,
  MonitorTransport,
} from "../src/monitoring/backend-monitor.reporter";
import {
  IngestPayload,
  ResolvedBackendMonitorOptions,
} from "../src/monitoring/backend-monitor.types";

const baseOptions: ResolvedBackendMonitorOptions = {
  enabled: true,
  endpoint: "http://example.test",
  token: "token-value",
  env: "test",
  instanceId: "test-host",
  appVersion: "1.0.0",
  flushIntervalMs: 5000,
  maxBatchSize: 500,
  maxQueueSize: 2000,
};

const requestEvent = (id: number) => ({
  requestId: `req-${id}`,
  route: "/users/:id",
  path: `/users/${id}`,
  method: "GET",
  statusCode: 200,
  requestAt: "2026-09-26T00:00:00.000Z",
  responseAt: "2026-09-26T00:00:00.050Z",
});

const errorEvent = (id: number) => ({
  requestId: `req-${id}`,
  type: "TypeError",
  message: `boom ${id}`,
  stack: "TypeError: boom\n    at f (/s/f.ts:1:1)",
  route: "/users/:id",
  path: `/users/${id}`,
  method: "GET",
  statusCode: 500,
  occurredAt: "2026-09-26T00:00:00.000Z",
});

describe("MonitorEventReporter", () => {
  it("batches requests and errors into one payload with dimensions", async () => {
    const sent: IngestPayload[] = [];
    const transport: MonitorTransport = async (payload) => {
      sent.push(payload);
    };
    const reporter = new MonitorEventReporter(baseOptions, transport);

    reporter.enqueueRequest(requestEvent(1));
    reporter.enqueueRequest(requestEvent(2));
    reporter.enqueueRequest(requestEvent(3));
    reporter.enqueueError(errorEvent(1));

    await reporter.flush();

    assert.equal(sent.length, 1);
    assert.equal(sent[0].requests.length, 3);
    assert.equal(sent[0].errors.length, 1);
    assert.equal(sent[0].env, "test");
    assert.equal(sent[0].instanceId, "test-host");
    assert.equal(sent[0].appVersion, "1.0.0");
    assert.equal(reporter.pendingCount, 0);
    // A second flush on an empty queue does nothing.
    await reporter.flush();
    assert.equal(sent.length, 1);
  });

  it("drops NEW events once the queue is full and counts them", () => {
    const reporter = new MonitorEventReporter(
      { ...baseOptions, maxQueueSize: 2 },
      async () => undefined,
    );

    reporter.enqueueRequest(requestEvent(1));
    reporter.enqueueRequest(requestEvent(2));
    reporter.enqueueRequest(requestEvent(3));
    reporter.enqueueRequest(requestEvent(4));
    reporter.enqueueRequest(requestEvent(5));

    assert.equal(reporter.pendingCount, 2);
    assert.equal(reporter.droppedCount, 3);
  });

  it("caps each kind at maxBatchSize and keeps overflow for the next flush", async () => {
    const sent: IngestPayload[] = [];
    const reporter = new MonitorEventReporter(
      { ...baseOptions, maxBatchSize: 500, maxQueueSize: 2000 },
      async (payload) => {
        sent.push(payload);
      },
    );

    for (let i = 0; i < 600; i += 1) reporter.enqueueRequest(requestEvent(i));

    await reporter.flush();

    assert.equal(sent.length, 2);
    assert.equal(sent[0].requests.length, 500);
    assert.equal(sent[1].requests.length, 100);
    assert.equal(reporter.pendingCount, 0);
  });

  it("does not throw and drops the batch when the transport rejects", async () => {
    const reporter = new MonitorEventReporter(baseOptions, async () => {
      throw new Error("network down");
    });

    reporter.enqueueRequest(requestEvent(1));
    reporter.enqueueError(errorEvent(1));

    await assert.doesNotReject(reporter.flush());
    assert.equal(reporter.failedBatchCount, 1);
    // The failed batch is abandoned, not re-queued.
    assert.equal(reporter.pendingCount, 0);
  });

  it("never overlaps two flushes and drains items enqueued during a flush", async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    let batches = 0;
    const reporter = new MonitorEventReporter(baseOptions, async () => {
      concurrent += 1;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((resolve) => setTimeout(resolve, 5));
      concurrent -= 1;
      batches += 1;
    });

    reporter.enqueueRequest(requestEvent(1));
    const first = reporter.flush();
    reporter.enqueueRequest(requestEvent(2));
    const second = reporter.flush();
    await Promise.all([first, second]);

    // The overlapping call was skipped; the first flush's drain tail ships
    // event 2 without ever running two transports concurrently.
    assert.equal(maxConcurrent, 1);
    assert.equal(batches, 2);
    assert.equal(reporter.pendingCount, 0);
  });
});
