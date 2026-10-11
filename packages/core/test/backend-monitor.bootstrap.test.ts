import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { INestApplication } from "@nestjs/common";

import { startBackendMonitoring, type BackendMonitoringHandle } from "@devbie/backend-monitor-sdk/nest";

function createFakeApp() {
  const middlewares: unknown[] = [];
  const interceptors: unknown[] = [];
  const app = {
    use: (middleware: unknown) => {
      middlewares.push(middleware);
    },
    useGlobalInterceptors: (...registered: unknown[]) => {
      interceptors.push(...registered);
    },
  } as unknown as INestApplication;
  return { app, middlewares, interceptors };
}

const enabledOptions = {
  enabled: true as const,
  endpoint: "http://example.test",
  token: "token-value",
};

const handles: BackendMonitoringHandle[] = [];
function track(handle: BackendMonitoringHandle | null): BackendMonitoringHandle | null {
  if (handle) handles.push(handle);
  return handle;
}

afterEach(() => {
  while (handles.length > 0) {
    handles.pop()!.stop();
  }
});

describe("startBackendMonitoring", () => {
  it("returns null and registers nothing when disabled", () => {
    const { app, middlewares, interceptors } = createFakeApp();

    const handle = startBackendMonitoring(app, { enabled: false, endpoint: "x", token: "y" });

    assert.equal(handle, null);
    assert.equal(middlewares.length, 0);
    assert.equal(interceptors.length, 0);
  });

  it("registers the request middleware and error interceptor when enabled", () => {
    const { app, middlewares, interceptors } = createFakeApp();

    const handle = track(startBackendMonitoring(app, enabledOptions));

    assert.notEqual(handle, null);
    assert.equal(middlewares.length, 1);
    assert.equal(typeof middlewares[0], "function");
    assert.equal(interceptors.length, 1);
  });

  it("is idempotent across re-bootstrap and registers the probe only once", () => {
    const first = createFakeApp();
    const second = createFakeApp();

    const handle1 = track(startBackendMonitoring(first.app, enabledOptions));
    const handle2 = track(startBackendMonitoring(second.app, enabledOptions));

    assert.equal(handle1, handle2);
    assert.equal(first.middlewares.length, 1);
    // The second call returns the existing singleton and wires nothing new.
    assert.equal(second.middlewares.length, 0);
    assert.equal(second.interceptors.length, 0);
  });

  it("releases the singleton on stop so a later bootstrap starts fresh", () => {
    const first = createFakeApp();
    const second = createFakeApp();

    const handle1 = startBackendMonitoring(first.app, enabledOptions);
    assert.notEqual(handle1, null);
    handle1!.stop();

    const handle2 = track(startBackendMonitoring(second.app, enabledOptions));
    assert.notEqual(handle2, null);
    assert.notEqual(handle1, handle2);
    assert.equal(second.middlewares.length, 1);
    assert.equal(second.interceptors.length, 1);
  });
});
