import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addAssets,
  dedupeAssets,
  isSameAsset,
  removeAssets,
} from "../src/core/assets";

describe("isSameAsset", () => {
  it("compares glob strings by value", () => {
    assert.ok(isSameAsset("a/*.json", "a/*.json"));
    assert.ok(!isSameAsset("a/*.json", "b/*.json"));
  });

  it("compares object assets structurally", () => {
    assert.ok(
      isSameAsset({ include: "a" }, { include: "a", outDir: undefined }),
    );
    assert.ok(
      isSameAsset({ include: "a", outDir: "d" }, { include: "a", outDir: "d" }),
    );
    assert.ok(
      !isSameAsset(
        { include: "a", outDir: "d1" },
        { include: "a", outDir: "d2" },
      ),
    );
  });
});

describe("addAssets / removeAssets / dedupeAssets", () => {
  it("adds idempotently, removes precisely and dedupes mixed entries", () => {
    const once = addAssets(["x"], [{ include: "y" }]);
    const twice = addAssets(once, [{ include: "y" }, "x"]);
    assert.deepEqual(twice, ["x", { include: "y" }]);

    assert.deepEqual(removeAssets(twice, [{ include: "y" }]), ["x"]);

    assert.deepEqual(
      dedupeAssets(["x", "x", { include: "y" }, { include: "y" }]),
      ["x", { include: "y" }],
    );
  });
});
