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
  globalThis.fetch = (async (
    url: string | URL | Request,
    init?: RequestInit,
  ) => {
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
      applicationId: "app-1",
      token: "tok-1",
    });
    assert.equal(typeof handle.stop, "function");
    handle.stop();
  });

  it("is idempotent: second call returns the same handle", () => {
    cleanup();
    const first = startHeartbeat({
      endpoint: "http://a",
      applicationId: "a",
      token: "t",
    });
    const second = startHeartbeat({
      endpoint: "http://b",
      applicationId: "b",
      token: "t",
    });
    assert.strictEqual(first, second);
    first.stop();
  });

  it("sends POST to correct URL with X-Application-Token header", async () => {
    cleanup();
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHeartbeat({
      endpoint: "http://localhost:3000/",
      applicationId: "app-123",
      token: "secret-token",
      intervalMs: 60_000,
    });
    // Wait for the immediate beat to complete.
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(spy.calls.length, 1);
    const [url, init] = spy.calls[0];
    assert.equal(url, "http://localhost:3000/applications/app-123/heartbeat");
    assert.equal(init.method, "POST");
    assert.equal(
      (init.headers as Record<string, string>)["X-Application-Token"],
      "secret-token",
    );
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
      applicationId: "app-1",
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
      applicationId: "app-1",
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
      applicationId: "a",
      token: "t",
    });
    first.stop();
    const second = startHeartbeat({
      endpoint: "http://b",
      applicationId: "b",
      token: "t",
    });
    assert.notStrictEqual(first, second);
    second.stop();
  });
});
