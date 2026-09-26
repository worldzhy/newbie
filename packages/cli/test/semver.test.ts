import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  compareSemverTags,
  parseSemverTag,
  pickLatestSemverTag,
} from "../src/core/semver";

describe("parseSemverTag", () => {
  it("parses plain and v-prefixed tags", () => {
    assert.deepEqual(parseSemverTag("1.2.3"), {
      tag: "1.2.3",
      major: 1,
      minor: 2,
      patch: 3,
    });
    assert.equal(parseSemverTag("v1.2.3")?.major, 1);
  });

  it("rejects non-semver tags", () => {
    assert.equal(parseSemverTag("latest"), null);
    assert.equal(parseSemverTag("1.2"), null);
    assert.equal(parseSemverTag("1.2.3-rc.1"), null);
  });
});

describe("compareSemverTags / pickLatestSemverTag", () => {
  it("orders by major, minor then patch", () => {
    const sorted = ["1.10.0", "2.0.0", "1.2.3"]
      .map((t) => parseSemverTag(t)!)
      .sort(compareSemverTags);
    assert.deepEqual(
      sorted.map((t) => t.tag),
      ["1.2.3", "1.10.0", "2.0.0"],
    );
  });

  it("picks the latest tag from a mixed list", () => {
    assert.equal(
      pickLatestSemverTag(["foo", "1.0.0", "1.0.2", "0.9.9"]),
      "1.0.2",
    );
  });

  it("returns null when no semver tag exists", () => {
    assert.equal(pickLatestSemverTag(["main", "dev"]), null);
  });
});
