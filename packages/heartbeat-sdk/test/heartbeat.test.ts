import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { startHeartbeat } from "../src/index";

const GLOBAL_KEY = Symbol.for("@devbie/heartbeat-sdk:active");

function cleanup(): void {
  const handle = (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
  if (handle && typeof (handle as { stop?: () => void }).stop === "function") {
    (handle as { stop(): void }).stop();
  }
}

type FetchFn = typeof globalThis.fetch;

function mockFetch(impl: () => Promise<Response>): {
  calls: Array<[string, RequestInit]>;
  restore: () => void;
} {
  const calls: Array<[string, RequestInit]> = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push([String(url), init ?? {}]);
    return impl();
  }) as FetchFn;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

describe("startHeartbeat", () => {
  it("returns a handle with stop()", () => {
    cleanup();
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000",
      token: "tok-1",
    });
    assert.equal(typeof handle.stop, "function");
    handle.stop();
  });

  it("is idempotent: second call returns the same handle", () => {
    cleanup();
    const first = startHeartbeat({
      endpoint: "http://a",
      token: "t",
    });
    const second = startHeartbeat({
      endpoint: "http://b",
      token: "t",
    });
    assert.strictEqual(first, second);
    first.stop();
  });

  it("sends POST to correct URL with X-Heartbeat-Token header", async () => {
    cleanup();
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000/",
      token: "secret-token",
      intervalMs: 60_000,
    });
    // Wait for the immediate beat to complete.
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(spy.calls.length, 1);
    const [url, init] = spy.calls[0];
    assert.equal(url, "http://localhost:3000/heartbeat/ping");
    assert.equal(init.method, "POST");
    assert.equal((init.headers as Record<string, string>)["X-Heartbeat-Token"], "secret-token");
    assert.equal(init.body, undefined);
    handle.stop();
    spy.restore();
  });

  it("sends optional metadata as JSON body", async () => {
    cleanup();
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000",
      token: "tok-meta",
      intervalMs: 60_000,
      appVersion: "1.2.3",
      env: "prod",
      instanceId: "i-abc",
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    const [, init] = spy.calls[0];
    const headers = init.headers as Record<string, string>;
    assert.equal(headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(init.body as string), {
      appVersion: "1.2.3",
      env: "prod",
      instanceId: "i-abc",
    });
    handle.stop();
    spy.restore();
  });

  it("silently drops network errors", async () => {
    cleanup();
    const spy = mockFetch(async () => {
      throw new Error("network down");
    });
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000",
      token: "tok-1",
      intervalMs: 60_000,
    });
    // Should not throw even though fetch rejects.
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(spy.calls.length, 1);
    handle.stop();
    spy.restore();
  });

  it("stops the interval when stop() is called", async () => {
    cleanup();
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000",
      token: "tok-1",
      intervalMs: 50,
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const callsBeforeStop = spy.calls.length;
    handle.stop();
    await new Promise((resolve) => setTimeout(resolve, 120));
    assert.equal(spy.calls.length, callsBeforeStop);
    spy.restore();
  });

  it("allows restart after stop()", () => {
    cleanup();
    const first = startHeartbeat({
      endpoint: "http://a",
      token: "t",
    });
    first.stop();
    const second = startHeartbeat({
      endpoint: "http://b",
      token: "t",
    });
    assert.notStrictEqual(first, second);
    second.stop();
  });
});
