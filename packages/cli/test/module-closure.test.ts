import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DependencyGraph,
  directDependents,
  expandModuleClosure,
  findMissingEnabledModules,
  findRemovalBlocks,
} from "../src/core/module-closure";

function graph(edges: Record<string, string[]>): DependencyGraph {
  return new Map(Object.entries(edges));
}

describe("expandModuleClosure", () => {
  it("keeps roots first and appends sorted transitive additions", () => {
    const closure = expandModuleClosure(
      ["account"],
      graph({ account: ["security", "audit"], audit: ["security"], security: [] }),
    );
    assert.deepEqual(closure.keys, ["account", "audit", "security"]);
    assert.deepEqual(closure.added, ["audit", "security"]);
    assert.deepEqual(closure.missing, []);
  });

  it("de-duplicates roots and diamond dependencies", () => {
    const closure = expandModuleClosure(["a", "a", "b"], graph({ a: ["shared"], b: ["shared"], shared: [] }));
    assert.deepEqual(closure.keys, ["a", "b", "shared"]);
  });

  it("tolerates dependency cycles", () => {
    const closure = expandModuleClosure(["a"], graph({ a: ["b"], b: ["a"], c: ["a"] }));
    assert.deepEqual(closure.keys.sort(), ["a", "b"]);
  });

  it("reports edges to missing modules but keeps traversing", () => {
    const closure = expandModuleClosure(
      ["account"],
      graph({ account: ["audit", "ghost"], audit: ["security"], security: [] }),
    );
    assert.deepEqual(closure.keys, ["account", "audit", "security"]);
    assert.deepEqual(closure.missing, [{ module: "account", dependency: "ghost" }]);
  });

  it("leaves unknown roots in the key list untouched", () => {
    const closure = expandModuleClosure(["ghost"], graph({}));
    assert.deepEqual(closure.keys, ["ghost"]);
    assert.deepEqual(closure.added, []);
  });
});

describe("directDependents", () => {
  const edges = graph({ account: ["security"], audit: ["security"], saas: [] });

  it("lists modules declaring a dependency on a target, restricted to a set", () => {
    assert.deepEqual(directDependents("security", edges), ["account", "audit"]);
    assert.deepEqual(directDependents("security", edges, new Set(["account", "saas"])), ["account"]);
  });
});

describe("findRemovalBlocks", () => {
  const edges = graph({
    organization: ["account"],
    account: ["audit"],
    audit: ["security"],
    security: [],
  });

  it("blocks removing a directly required module", () => {
    const blocks = findRemovalBlocks(["audit"], ["account"], edges);
    assert.deepEqual(blocks, [{ key: "audit", requiredBy: ["account"] }]);
  });

  it("blocks removing an indirectly required module", () => {
    const blocks = findRemovalBlocks(["security"], ["organization"], edges);
    assert.deepEqual(blocks, [{ key: "security", requiredBy: ["audit"] }]);
  });

  it("allows removing modules whose dependents are no longer in the kept closure", () => {
    // Only 'security' survives: neither account nor audit is reachable anymore.
    const blocks = findRemovalBlocks(["account", "audit"], ["security"], edges);
    assert.deepEqual(blocks, []);
  });

  it("allows removing a module nobody depends on", () => {
    const blocks = findRemovalBlocks(["organization"], ["account", "audit", "security"], edges);
    assert.deepEqual(blocks, []);
  });
});

describe("findMissingEnabledModules", () => {
  it("flags declared dependencies absent from the enabled set", () => {
    const missing = findMissingEnabledModules(["account"], graph({ account: ["audit", "security"] }));
    assert.deepEqual(missing, [
      { module: "account", dependency: "audit" },
      { module: "account", dependency: "security" },
    ]);
  });

  it("returns nothing when the closure is fully enabled", () => {
    const missing = findMissingEnabledModules(
      ["account", "audit", "security"],
      graph({ account: ["audit", "security"], audit: ["security"], security: [] }),
    );
    assert.deepEqual(missing, []);
  });
});
