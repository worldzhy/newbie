import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LayeredModule, lintModuleLayers } from "../src/core/layer-lint";

function mod(key: string, layer: string | undefined, dependencies: string[] = []): LayeredModule {
  return { key, layer, dependencies };
}

describe("lintModuleLayers", () => {
  it("accepts a clean downward graph", () => {
    const findings = lintModuleLayers([
      mod("security", "foundation"),
      mod("account", "capability", ["security"]),
      mod("order", "domain", ["account", "security"]),
    ]);
    assert.deepEqual(findings, []);
  });

  it("flags an upward dependency as an error", () => {
    const findings = lintModuleLayers([mod("security", "foundation", ["account"]), mod("account", "capability")]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].level, "error");
    assert.match(findings[0].message, /foundation module must not depend on capability module 'account'/);
  });

  it("warns on same-layer dependencies", () => {
    const findings = lintModuleLayers([mod("account", "capability"), mod("organization", "capability", ["account"])]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].level, "warning");
    assert.match(findings[0].message, /same-layer dependency on 'account'/);
  });

  it("flags same-layer import cycles as errors", () => {
    const findings = lintModuleLayers([mod("a", "capability", ["b"]), mod("b", "capability", ["a"])]);
    const cycle = findings.find((finding) => finding.message.includes("cycle"));
    assert.ok(cycle);
    assert.equal(cycle.level, "error");
    assert.match(cycle.message, /capability layer import cycle: a <-> b/);
  });

  it("flags layered modules depending on layer-less module-hub", () => {
    const findings = lintModuleLayers([mod("module-hub", undefined), mod("account", "capability", ["module-hub"])]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].level, "error");
    assert.match(findings[0].message, /must not depend on layer-less module 'module-hub'/);
  });

  it("allows layer-less module-hub to depend on layered modules", () => {
    const findings = lintModuleLayers([
      mod("module-hub", undefined, ["security", "account"]),
      mod("security", "foundation"),
      mod("account", "capability"),
    ]);
    assert.deepEqual(findings, []);
  });

  it("flags unknown layers and unknown import targets", () => {
    const findings = lintModuleLayers([mod("a", "core", ["ghost"])]);
    assert.equal(findings.length, 2);
    assert.ok(findings.every((finding) => finding.level === "error"));
    assert.match(findings[0].message, /unknown layer 'core'/);
    assert.match(findings[1].message, /'@modules\/ghost' which is not a registry module/);
  });
});
