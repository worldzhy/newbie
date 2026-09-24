import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildInstallSpecs,
  planDependencyRemovals,
} from "../src/core/dependency-plan";
import { sanitizeModuleNames } from "../src/core/module-manifest";

describe("sanitizeModuleNames", () => {
  const catalog = new Set(["account", "queue"]);

  it("trims, validates against the catalog and de-duplicates", () => {
    assert.deepEqual(
      sanitizeModuleNames(["account", " account", "unknown", "queue"], catalog),
      ["account", "queue"],
    );
  });
});

describe("planDependencyRemovals", () => {
  it("keeps deps still used by enabled modules", () => {
    const removed = [
      {
        dependencies: { shared: "1.0.0", onlyB: "2.0.0" },
        devDependencies: { td: "1.0.0" },
      },
    ];
    const enabled = [{ dependencies: { shared: "1.0.0" } }];
    assert.deepEqual(planDependencyRemovals(removed, enabled), {
      dependencies: ["onlyB"],
      devDependencies: ["td"],
    });
  });
});

describe("buildInstallSpecs", () => {
  it("builds name@range specs for prod and dev separately", () => {
    assert.deepEqual(
      buildInstallSpecs([
        { dependencies: { a: "^1.0.0" }, devDependencies: { b: "^2.0.0" } },
      ]),
      {
        dependencies: ["a@^1.0.0"],
        devDependencies: ["b@^2.0.0"],
      },
    );
  });
});
