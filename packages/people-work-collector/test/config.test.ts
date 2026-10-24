import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { writeConfigFromProfile } from "../src/config";

function configPath(): string {
  return join(mkdtempSync(join(tmpdir(), "people-collector-profile-")), "config.json");
}

describe("writeConfigFromProfile", () => {
  it("writes a config carrying the profile credentials", () => {
    const path = configPath();

    writeConfigFromProfile({ endpoint: "https://nw.example.com/", token: "token-1", memberUserId: "user-1" }, path);

    const written = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(written.endpoint, "https://nw.example.com");
    assert.equal(written.token, "token-1");
    assert.equal(written.memberUserId, "user-1");
    assert.deepEqual(written.workspaces, []);
  });

  it("rejects an incomplete profile", () => {
    assert.throws(() =>
      writeConfigFromProfile({ endpoint: "", token: "token-1", memberUserId: "user-1" }, configPath()),
    );
  });
});
