import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createEmptyModulesState,
  diffModuleKeys,
  moduleKeys,
  normalizeModulesState,
  withModuleKeys,
} from "../src/core/modules-state";

describe("normalizeModulesState", () => {
  it("builds an empty state from malformed input", () => {
    assert.deepEqual(normalizeModulesState(null), createEmptyModulesState());
    assert.deepEqual(moduleKeys(normalizeModulesState("nope")), []);
  });

  it("keeps valid records and drops/normalises junk fields", () => {
    const state = normalizeModulesState({
      registry: { url: "https://example.invalid/r.git", sourceCommit: "abc" },
      modules: [
        { key: "a", sourceCommit: "aaa", localPatches: ["x", 1] },
        { key: 1 },
        "nope",
        { key: "b", version: "1.2.3" },
      ],
    });
    assert.deepEqual(state.modules, [
      { key: "a", version: null, sourceCommit: "aaa", localPatches: ["x"] },
      { key: "b", version: "1.2.3", sourceCommit: null, localPatches: [] },
    ]);
  });

  it("de-duplicates repeated module keys", () => {
    const state = normalizeModulesState({
      modules: [{ key: "a" }, { key: "a" }],
    });
    assert.deepEqual(moduleKeys(state), ["a"]);
  });
});

describe("diffModuleKeys", () => {
  it("computes added and removed keys", () => {
    assert.deepEqual(diffModuleKeys(["a", "b"], ["b", "c"]), {
      added: ["c"],
      removed: ["a"],
    });
  });
});

describe("withModuleKeys", () => {
  it("preserves pins of retained modules and adds empty records for new keys", () => {
    const state = normalizeModulesState({
      modules: [{ key: "a", sourceCommit: "aaa", localPatches: ["p"] }],
    });
    const next = withModuleKeys(state, ["b", "a"]);
    assert.deepEqual(next.modules, [
      { key: "b", version: null, sourceCommit: null, localPatches: [] },
      { key: "a", version: null, sourceCommit: "aaa", localPatches: ["p"] },
    ]);
  });

  it("de-duplicates the requested keys", () => {
    const next = withModuleKeys(createEmptyModulesState(), ["a", "a"]);
    assert.deepEqual(moduleKeys(next), ["a"]);
  });
});
