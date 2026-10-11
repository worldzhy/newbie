import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { FrameworkModule, resolveBackendMonitorModule } from "../src/framework.module";

describe("resolveBackendMonitorModule", () => {
  const originalEndpoint = process.env.BACKEND_MONITOR_API_URL;
  const originalToken = process.env.BACKEND_MONITOR_REPORT_TOKEN;

  beforeEach(() => {
    delete process.env.BACKEND_MONITOR_API_URL;
    delete process.env.BACKEND_MONITOR_REPORT_TOKEN;
  });

  afterEach(() => {
    if (originalEndpoint === undefined) {
      delete process.env.BACKEND_MONITOR_API_URL;
    } else {
      process.env.BACKEND_MONITOR_API_URL = originalEndpoint;
    }
    if (originalToken === undefined) {
      delete process.env.BACKEND_MONITOR_REPORT_TOKEN;
    } else {
      process.env.BACKEND_MONITOR_REPORT_TOKEN = originalToken;
    }
  });

  it("returns null when no monitor env is set", () => {
    assert.equal(resolveBackendMonitorModule(), null);
  });

  it("returns null when only one of the two env vars is set", () => {
    process.env.BACKEND_MONITOR_API_URL = "https://nightwatch.example.com";
    assert.equal(resolveBackendMonitorModule(), null);

    delete process.env.BACKEND_MONITOR_API_URL;
    process.env.BACKEND_MONITOR_REPORT_TOKEN = "token";
    assert.equal(resolveBackendMonitorModule(), null);
  });

  it("assembles a global module when both env vars are set", () => {
    process.env.BACKEND_MONITOR_API_URL = "https://nightwatch.example.com";
    process.env.BACKEND_MONITOR_REPORT_TOKEN = "token";

    const dynamic = resolveBackendMonitorModule();
    assert.notEqual(dynamic, null);
    assert.equal(dynamic!.global, true);
  });
});

describe("FrameworkModule.forRoot backend monitor assembly", () => {
  const originalEndpoint = process.env.BACKEND_MONITOR_API_URL;
  const originalToken = process.env.BACKEND_MONITOR_REPORT_TOKEN;

  afterEach(() => {
    if (originalEndpoint === undefined) {
      delete process.env.BACKEND_MONITOR_API_URL;
    } else {
      process.env.BACKEND_MONITOR_API_URL = originalEndpoint;
    }
    if (originalToken === undefined) {
      delete process.env.BACKEND_MONITOR_REPORT_TOKEN;
    } else {
      process.env.BACKEND_MONITOR_REPORT_TOKEN = originalToken;
    }
  });

  it("skips the probe when env is absent", () => {
    delete process.env.BACKEND_MONITOR_API_URL;
    delete process.env.BACKEND_MONITOR_REPORT_TOKEN;

    const dynamic = FrameworkModule.forRoot({ prisma: { PrismaClient: class {} } });
    assert.equal(dynamic.imports!.length, 4);
  });

  it("registers the probe module when env is present", () => {
    process.env.BACKEND_MONITOR_API_URL = "https://nightwatch.example.com";
    process.env.BACKEND_MONITOR_REPORT_TOKEN = "token";

    const dynamic = FrameworkModule.forRoot({ prisma: { PrismaClient: class {} } });
    assert.equal(dynamic.imports!.length, 5);
  });
});
