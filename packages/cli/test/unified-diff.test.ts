import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { unifiedDiff } from "../src/core/unified-diff";

describe("unifiedDiff", () => {
  it("returns an empty string for identical inputs", () => {
    assert.equal(unifiedDiff("a\nb\n", "a\nb\n", "a/f", "b/f"), "");
  });

  it("diffs a single changed line with full context", () => {
    const diff = unifiedDiff("1\n2\n3\n", "1\n4\n3\n", "a/f", "b/f");
    assert.equal(
      diff,
      [
        "--- a/f",
        "+++ b/f",
        "@@ -1,3 +1,3 @@",
        " 1",
        "-2",
        "+4",
        " 3",
        "",
      ].join("\n"),
    );
  });

  it("uses /dev/null-style all-added hunks for new content", () => {
    const diff = unifiedDiff("", "x\ny\n", "/dev/null", "b/f");
    assert.equal(
      diff,
      ["--- /dev/null", "+++ b/f", "@@ -0,0 +1,2 @@", "+x", "+y", ""].join(
        "\n",
      ),
    );
  });

  it("splits distant changes into separate hunks", () => {
    const a =
      Array.from({ length: 20 }, (_, i) => `${i + 1}`).join("\n") + "\n";
    const bLines = Array.from({ length: 20 }, (_, i) => `${i + 1}`);
    bLines[1] = "2*";
    bLines[17] = "18*";
    const diff = unifiedDiff(a, bLines.join("\n") + "\n", "a/f", "b/f");
    assert.equal(
      diff,
      [
        "--- a/f",
        "+++ b/f",
        "@@ -1,4 +1,4 @@",
        " 1",
        "-2",
        "+2*",
        " 3",
        " 4",
        "@@ -15,6 +15,6 @@",
        " 15",
        " 16",
        " 17",
        "-18",
        "+18*",
        " 19",
        " 20",
        "",
      ].join("\n"),
    );
  });

  it("merges nearby changes into one hunk", () => {
    const a =
      Array.from({ length: 10 }, (_, i) => `${i + 1}`).join("\n") + "\n";
    const bLines = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
    bLines[2] = "3*";
    bLines[5] = "6*";
    const diff = unifiedDiff(a, bLines.join("\n") + "\n", "a/f", "b/f");
    assert.match(diff, /@@ -1,8 \+1,8 @@/);
    assert.equal((diff.match(/@@/g) ?? []).length, 2); // one hunk header
  });

  it("handles a pure addition at the end", () => {
    const diff = unifiedDiff("1\n", "1\n2\n", "a/f", "b/f");
    assert.equal(
      diff,
      ["--- a/f", "+++ b/f", "@@ -1 +1,2 @@", " 1", "+2", ""].join("\n"),
    );
  });
});
