import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";

import { ALLOW_ANY_ORIGIN_KEY, AllowAnyOrigin } from "../src/cors/allow-any-origin.decorator";
import { AllowAnyOriginRegistry } from "../src/cors/allow-any-origin.registry";

class ReportController {}

function defineReportHandler(): void {
  const prototype = ReportController.prototype as unknown as Record<string, unknown>;
  prototype.ping = function ping(): void {};
  const descriptor = Object.getOwnPropertyDescriptor(ReportController.prototype, "ping")!;
  AllowAnyOrigin()(ReportController.prototype, "ping", descriptor);
  const handler = prototype.ping as object;
  Reflect.defineMetadata(PATH_METADATA, "heartbeat", ReportController);
  Reflect.defineMetadata(PATH_METADATA, "ping", handler);
  Reflect.defineMetadata(METHOD_METADATA, RequestMethod.POST, handler);
}

function scanRegistry(): void {
  defineReportHandler();
  const discovery = {
    getControllers: () => [{ instance: new ReportController(), metatype: ReportController }],
  };
  const metadataScanner = { getAllMethodNames: () => ["ping"] };
  new AllowAnyOriginRegistry(discovery as never, metadataScanner as never, new Reflector()).onModuleInit();
}

function fakeResponse() {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let ended = false;
  return {
    headers,
    get statusCode() {
      return statusCode;
    },
    get ended() {
      return ended;
    },
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    end() {
      ended = true;
    },
  };
}

describe("AllowAnyOrigin", () => {
  it("sets the allowAnyOrigin metadata key", () => {
    defineReportHandler();
    const value = Reflect.getMetadata(
      ALLOW_ANY_ORIGIN_KEY,
      (ReportController.prototype as unknown as Record<string, unknown>).ping as object,
    );
    assert.equal(value, true);
  });

  it("registers decorated routes and answers exact-method matches", () => {
    scanRegistry();
    assert.equal(AllowAnyOriginRegistry.matches("POST", "/heartbeat/ping"), true);
    assert.equal(AllowAnyOriginRegistry.matches("POST", "/HEARTBEAT/PING/"), true);
    assert.equal(AllowAnyOriginRegistry.matches("GET", "/heartbeat/ping"), false);
    assert.equal(AllowAnyOriginRegistry.matches("POST", "/health/snapshot"), false);
  });

  it("answers OPTIONS/HEAD on registered paths so preflight never reaches Nest", () => {
    scanRegistry();
    assert.equal(AllowAnyOriginRegistry.matches("OPTIONS", "/heartbeat/ping"), true);
    assert.equal(AllowAnyOriginRegistry.matches("HEAD", "/heartbeat/ping"), true);
  });

  it("sets ACAO:* and ends preflight for registered routes", () => {
    scanRegistry();
    const res = fakeResponse();
    let nextCalled = false;
    AllowAnyOriginRegistry.handleRequest({ method: "OPTIONS", path: "/heartbeat/ping" } as never, res as never, () => {
      nextCalled = true;
    });
    assert.equal(res.headers["Access-Control-Allow-Origin"], "*");
    assert.equal(res.statusCode, 204);
    assert.equal(res.ended, true);
    assert.equal(nextCalled, false);
  });

  it("passes non-matching requests through untouched", () => {
    scanRegistry();
    const res = fakeResponse();
    let nextCalled = false;
    AllowAnyOriginRegistry.handleRequest({ method: "POST", path: "/auth/login" } as never, res as never, () => {
      nextCalled = true;
    });
    assert.equal(res.headers["Access-Control-Allow-Origin"], undefined);
    assert.equal(nextCalled, true);
  });
});
