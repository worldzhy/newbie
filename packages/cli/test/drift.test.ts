import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { diffSnapshots, driftPatchIds } from "../src/core/drift";

const snapshot = (entries: Record<string, string>) => new Map(Object.entries(entries));

describe("diffSnapshots", () => {
  it("reports clean when snapshots are identical", () => {
    const a = snapshot({ "x.ts": "1", "dir/y.ts": "2" });
    assert.deepEqual(diffSnapshots(a, new Map(a)), {
      added: [],
      removed: [],
      changed: [],
      clean: true,
    });
  });

  it("classifies added, removed and changed files", () => {
    const local = snapshot({
      "new.ts": "9",
      "changed.ts": "b",
      "same.ts": "s",
    });
    const pristine = snapshot({
      "changed.ts": "a",
      "same.ts": "s",
      "gone.ts": "z",
    });
    const report = diffSnapshots(local, pristine);
    assert.equal(report.clean, false);
    assert.deepEqual(report.added, ["new.ts"]);
    assert.deepEqual(report.removed, ["gone.ts"]);
    assert.deepEqual(report.changed, ["changed.ts"]);
  });
});

describe("driftPatchIds", () => {
  it("lists every drifted path sorted", () => {
    const report = diffSnapshots(
      snapshot({ "b.ts": "1", "a.ts": "1" }),
      snapshot({ "c.ts": "1" }),
    );
    assert.deepEqual(driftPatchIds(report), ["a.ts", "b.ts", "c.ts"]);
  });
});
