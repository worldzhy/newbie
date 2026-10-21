import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderPublicNamespaceBody, spliceModulesBlock } from "../src/core/caddyfile-modules";

const TEMPLATE = `# Caddy template skeleton
__SITE_DOMAIN__ {
\tencode zstd gzip

# @@newbie-modules-start
# @@newbie-modules-end

\thandle {
\t\treverse_proxy frontend:3001
\t}
}
`;

describe("renderPublicNamespaceBody", () => {
  it("renders one handle block per key, sorted, blank-line separated", () => {
    assert.equal(
      renderPublicNamespaceBody(["web-monitor", "backend-monitor"]),
      "\thandle /backend-monitor/* {\n" +
        "\t\treverse_proxy backend:3000\n" +
        "\t}\n" +
        "\n" +
        "\thandle /web-monitor/* {\n" +
        "\t\treverse_proxy backend:3000\n" +
        "\t}\n",
    );
  });

  it("renders an empty body when nothing claims a namespace", () => {
    assert.equal(renderPublicNamespaceBody([]), "");
  });
});

describe("spliceModulesBlock", () => {
  it("replaces the marker block body and preserves surrounding content", () => {
    const next = spliceModulesBlock(TEMPLATE, renderPublicNamespaceBody(["web-monitor"]));
    assert.ok(next !== null);
    assert.ok(
      next.includes(
        "# @@newbie-modules-start\n" +
          "\thandle /web-monitor/* {\n" +
          "\t\treverse_proxy backend:3000\n" +
          "\t}\n" +
          "# @@newbie-modules-end\n",
      ),
    );
    assert.ok(next.startsWith("# Caddy template skeleton\n"));
    assert.ok(next.endsWith("}\n"));
    assert.ok(next.includes("\thandle {\n\t\treverse_proxy frontend:3001\n\t}\n"));
  });

  it("is idempotent across re-runs", () => {
    const body = renderPublicNamespaceBody(["web-monitor"]);
    const once = spliceModulesBlock(TEMPLATE, body);
    assert.ok(once !== null);
    assert.equal(spliceModulesBlock(once, body), once);
  });

  it("collapses to an empty block when no module claims a namespace", () => {
    const next = spliceModulesBlock(TEMPLATE, "");
    assert.ok(next !== null);
    assert.ok(next.includes("# @@newbie-modules-start\n# @@newbie-modules-end\n"));
  });

  it("returns null when the markers are absent (template defect, never appends)", () => {
    assert.equal(spliceModulesBlock("no markers here\n", "body"), null);
  });

  it("returns null when the markers are out of order", () => {
    const reversed = "# @@newbie-modules-end\n# @@newbie-modules-start\n";
    assert.equal(spliceModulesBlock(reversed, "body"), null);
  });
});
