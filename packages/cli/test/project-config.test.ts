import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createEmptyProjectConfig,
  diffEnabled,
  normalizeProjectConfig,
  withEnabledModules,
} from "../src/core/project-config";

describe("normalizeProjectConfig", () => {
  it("falls back to an empty enabled list for malformed input", () => {
    assert.deepEqual(normalizeProjectConfig(null).enabled, []);
    assert.deepEqual(normalizeProjectConfig("nope").enabled, []);
    assert.deepEqual(normalizeProjectConfig({ enabled: "x" }).enabled, []);
  });

  it("keeps string entries and drops junk", () => {
    assert.deepEqual(
      normalizeProjectConfig({ enabled: ["a", 1, "b", null] }).enabled,
      ["a", "b"],
    );
  });
});

describe("diffEnabled", () => {
  it("computes added and removed module names", () => {
    assert.deepEqual(diffEnabled(["a", "b"], ["b", "c"]), {
      added: ["c"],
      removed: ["a"],
    });
  });
});

describe("withEnabledModules", () => {
  it("prunes per-module release refs of removed modules", () => {
    const next = withEnabledModules(
      {
        enabled: ["a", "b"],
        microserviceReleaseRefs: { a: "1.0.0", b: "1.0.0" },
        releaseRefs: { a: "1.0.0" },
      },
      ["a"],
    );
    assert.deepEqual(next.enabled, ["a"]);
    assert.deepEqual(next.microserviceReleaseRefs, { a: "1.0.0" });
    assert.deepEqual(next.releaseRefs, { a: "1.0.0" });
  });

  it("starts from an empty config cleanly", () => {
    assert.deepEqual(
      withEnabledModules(createEmptyProjectConfig(), ["a"]).enabled,
      ["a"],
    );
  });
});
