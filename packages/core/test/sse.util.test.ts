import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";

import type { Response } from "express";

import {
  SSE_KEEPALIVE_MS,
  bindSseAbort,
  sseHeaders,
  writeSseEvent,
  writeSseKeepalive,
} from "../src/utilities/sse.util";

interface FakeResponse extends EventEmitter {
  chunks: string[];
  headers: Record<string, string>;
  statusCode: number;
  destroyed: boolean;
  writableEnded: boolean;
  flushed: boolean;
  status(code: number): FakeResponse;
  setHeader(name: string, value: string): void;
  flushHeaders(): void;
  write(chunk: string): boolean;
  end(): void;
}

function makeResponse(): FakeResponse {
  const emitter = new EventEmitter();
  const res = Object.assign(emitter, {
    chunks: [] as string[],
    headers: {} as Record<string, string>,
    statusCode: 0,
    destroyed: false,
    writableEnded: false,
    flushed: false,
    status(code: number): FakeResponse {
      res.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string): void {
      res.headers[name.toLowerCase()] = value;
    },
    flushHeaders(): void {
      res.flushed = true;
    },
    write(chunk: string): boolean {
      res.chunks.push(chunk);
      return true;
    },
    end(): void {
      res.writableEnded = true;
      res.emit("close");
    },
  });
  return res;
}

describe("sseHeaders", () => {
  it("sets the SSE headers and flushes them immediately", () => {
    const res = makeResponse();
    sseHeaders(res as unknown as Response);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers["content-type"], "text/event-stream");
    assert.equal(res.headers["cache-control"], "no-cache, no-transform");
    assert.equal(res.headers["connection"], "keep-alive");
    assert.equal(res.headers["x-accel-buffering"], "no");
    assert.equal(res.flushed, true);
  });
});

describe("writeSseEvent", () => {
  it("writes one event frame with a JSON payload", () => {
    const res = makeResponse();
    writeSseEvent(res as unknown as Response, "text-token", { text: "hi" });
    assert.deepEqual(res.chunks, ['event: text-token\ndata: {"text":"hi"}\n\n']);
  });

  it("no-ops once the stream has ended", () => {
    const res = makeResponse();
    res.writableEnded = true;
    writeSseEvent(res as unknown as Response, "done", {});
    assert.deepEqual(res.chunks, []);
  });

  it("no-ops once the socket is destroyed", () => {
    const res = makeResponse();
    res.destroyed = true;
    writeSseEvent(res as unknown as Response, "done", {});
    assert.deepEqual(res.chunks, []);
  });
});

describe("writeSseKeepalive", () => {
  it("writes a comment line", () => {
    const res = makeResponse();
    writeSseKeepalive(res as unknown as Response);
    assert.deepEqual(res.chunks, [": keepalive\n\n"]);
  });

  it("no-ops once the stream has ended", () => {
    const res = makeResponse();
    res.writableEnded = true;
    writeSseKeepalive(res as unknown as Response);
    assert.deepEqual(res.chunks, []);
  });
});

describe("bindSseAbort", () => {
  it("aborts the signal and runs the callback when the client disconnects mid-stream", () => {
    const res = makeResponse();
    let notified = 0;
    const binding = bindSseAbort(res as unknown as Response, () => {
      notified += 1;
    });
    assert.equal(binding.signal.aborted, false);
    res.emit("close");
    assert.equal(binding.signal.aborted, true);
    assert.equal(notified, 1);
  });

  it("does not abort when close comes from a normal end() after settle()", () => {
    const res = makeResponse();
    let notified = 0;
    const binding = bindSseAbort(res as unknown as Response, () => {
      notified += 1;
    });
    binding.settle();
    res.end();
    assert.equal(binding.signal.aborted, false);
    assert.equal(notified, 0);
    assert.equal(res.listenerCount("close"), 0);
  });

  it("aborts only once even if close fires twice", () => {
    const res = makeResponse();
    let notified = 0;
    const binding = bindSseAbort(res as unknown as Response, () => {
      notified += 1;
    });
    res.emit("close");
    res.emit("close");
    assert.equal(notified, 1);
    assert.equal(binding.signal.aborted, true);
  });
});

describe("SSE_KEEPALIVE_MS", () => {
  it("stays at 15 seconds", () => {
    assert.equal(SSE_KEEPALIVE_MS, 15_000);
  });
});
