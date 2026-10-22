import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { runCheck, scanKnownServices, startHealthReporting } from "../src/index";
import type { NamedHealthIndicator } from "../src/index";

const GLOBAL_KEY = Symbol.for("@devbie/health-sdk:active");

function stopActiveReporter(): void {
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

/** Minimal NestJS container shape consumed by scanKnownServices. */
function fakeContainer(providers: Record<string, unknown>): object {
  const wrapperMap = new Map(Object.entries(providers).map(([name, instance]) => [name, { name, instance }]));
  return { container: { modules: new Map([["root", { providers: wrapperMap }]]) } };
}

describe("runCheck", () => {
  it("reports ok with no indicators", async () => {
    assert.deepEqual(await runCheck([]), { status: "ok", info: {} });
  });

  it("aggregates up entries and reports ok", async () => {
    const indicators: NamedHealthIndicator[] = [
      { name: "prisma", check: async () => ({ status: "up" }) },
      { name: "redis", check: async () => ({ status: "up" }) },
    ];
    const result = await runCheck(indicators);
    assert.equal(result.status, "ok");
    assert.deepEqual(result.info, { prisma: { status: "up" }, redis: { status: "up" } });
  });

  it("marks the whole snapshot error when any indicator is down", async () => {
    const indicators: NamedHealthIndicator[] = [
      { name: "prisma", check: async () => ({ status: "up" }) },
      { name: "mongo", check: async () => ({ status: "down", message: "no connection" }) },
    ];
    const result = await runCheck(indicators);
    assert.equal(result.status, "error");
    assert.deepEqual(result.info.mongo, { status: "down", message: "no connection" });
  });

  it("records a throwing indicator as down instead of dropping it", async () => {
    const indicators: NamedHealthIndicator[] = [
      {
        name: "clickhouse",
        check: async () => {
          throw new Error("connection refused");
        },
      },
    ];
    const result = await runCheck(indicators);
    assert.equal(result.status, "error");
    assert.deepEqual(result.info.clickhouse, { status: "down", message: "connection refused" });
  });

  it("times out a hung indicator without stalling the snapshot", async () => {
    const started = Date.now();
    const result = await runCheck(
      [
        {
          name: "hung",
          check: () => new Promise(() => undefined),
        },
        { name: "prisma", check: async () => ({ status: "up" }) },
      ],
      20,
    );
    assert.equal(result.status, "error");
    assert.match(result.info.hung.message ?? "", /timeout after 20ms/);
    assert.deepEqual(result.info.prisma, { status: "up" });
    assert.ok(Date.now() - started < 1000);
  });
});

describe("scanKnownServices", () => {
  it("matches providers by constructor name and keeps the first instance", () => {
    const app = fakeContainer({ PrismaService: { id: "first" } });
    // Inject a duplicate wrapper to prove first-match-wins.
    const container = (app as { container: { modules: Map<string, { providers: Map<string, unknown> }> } }).container;
    container.modules.set("other", {
      providers: new Map([["dup", { name: "PrismaService", instance: { id: "second" } }]]),
    });

    const found = scanKnownServices(app, ["PrismaService"]);
    assert.equal(found.length, 1);
    assert.deepEqual(found[0].instance, { id: "first" });
  });

  it("ignores unresolved providers and unknown names", () => {
    const app = fakeContainer({ PrismaService: null, RedisService: { client: true } });
    assert.deepEqual(scanKnownServices(app, ["PrismaService", "MongoModelRegistry"]), []);
    assert.deepEqual(
      scanKnownServices(app, ["RedisService"]).map((entry) => entry.name),
      ["RedisService"],
    );
  });

  it("returns an empty list for an application without a container", () => {
    assert.deepEqual(scanKnownServices({}, ["PrismaService"]), []);
  });
});

describe("startHealthReporting", () => {
  afterEach(() => {
    stopActiveReporter();
  });

  it("is idempotent: the second call returns the existing handle", () => {
    const app = fakeContainer({});
    const first = startHealthReporting(app, { intervalMs: 60_000, initialDelayMs: 60_000 });
    const second = startHealthReporting(app, { intervalMs: 60_000, initialDelayMs: 60_000 });
    assert.strictEqual(first, second);
  });

  it("posts the aggregated snapshot with the health token and runtime facts", async () => {
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHealthReporting(
      fakeContainer({ PrismaService: { $queryRaw: async () => [{ "?column?": 1 }] } }),
      {
        endpoint: "https://host.test/health/snapshot",
        token: "health-token",
        intervalMs: 60_000,
        initialDelayMs: 0,
        appVersion: "2.0.0",
        env: "prod",
        instanceId: "i-abc",
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(spy.calls.length, 1);
    const [url, init] = spy.calls[0];
    assert.equal(url, "https://host.test/health/snapshot");
    assert.equal(init.method, "POST");
    const headers = init.headers as Record<string, string>;
    assert.equal(headers["X-Health-Token"], "health-token");
    assert.equal(headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(init.body as string), {
      appVersion: "2.0.0",
      env: "prod",
      instanceId: "i-abc",
      status: "ok",
      info: { prisma: { status: "up" } },
    });

    handle.stop();
    spy.restore();
  });

  it("runs checks locally without network traffic when no endpoint is configured", async () => {
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const handle = startHealthReporting(fakeContainer({ RedisService: {} }), {
      intervalMs: 60_000,
      initialDelayMs: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Checks still run locally, but no endpoint means no network traffic.
    assert.equal(spy.calls.length, 0);
    handle.stop();
    spy.restore();
  });

  it("swallows network failures", async () => {
    const spy = mockFetch(async () => {
      throw new Error("network down");
    });
    const handle = startHealthReporting(fakeContainer({}), {
      endpoint: "https://host.test/health/snapshot",
      token: "t",
      intervalMs: 60_000,
      initialDelayMs: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(spy.calls.length, 1);
    handle.stop();
    spy.restore();
  });

  it("stops the loop and allows a restart", async () => {
    const spy = mockFetch(async () => new Response(null, { status: 204 }));
    const first = startHealthReporting(fakeContainer({}), {
      endpoint: "https://host.test/health/snapshot",
      token: "t",
      intervalMs: 30,
      initialDelayMs: 0,
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    first.stop();
    const callsAfterStop = spy.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(spy.calls.length, callsAfterStop);

    const second = startHealthReporting(fakeContainer({}), {
      endpoint: "https://host.test/health/snapshot",
      token: "t",
      intervalMs: 60_000,
      initialDelayMs: 60_000,
    });
    assert.notStrictEqual(first, second);
    second.stop();
    spy.restore();
  });
});
