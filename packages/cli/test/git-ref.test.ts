import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertSafeGitRef } from "../src/core/git-ref";

describe("assertSafeGitRef", () => {
  it("accepts tags, commits and slash-separated branch names", () => {
    assert.equal(assertSafeGitRef("1.0.2"), "1.0.2");
    assert.equal(assertSafeGitRef("v1.2.3"), "v1.2.3");
    assert.equal(assertSafeGitRef("release/2026-09"), "release/2026-09");
    assert.equal(assertSafeGitRef("a1b2c3d"), "a1b2c3d");
  });

  it("rejects empty or non-string refs", () => {
    assert.throws(() => assertSafeGitRef(""), /Invalid/);
    assert.throws(() => assertSafeGitRef(undefined), /Invalid/);
  });

  it("rejects shell/escape sequences and path traversal", () => {
    for (const evil of [
      "main;rm -rf /",
      "main`whoami`",
      "a..b",
      "a//b",
      "@{x}",
      "/main",
      "main/",
      "main.",
      "a b",
    ]) {
      assert.throws(() => assertSafeGitRef(evil), /Invalid/);
    }
  });
});
