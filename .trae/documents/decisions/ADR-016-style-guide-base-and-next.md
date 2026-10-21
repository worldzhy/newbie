# ADR-016: style-guide entries become `base` and `next`

Date: 2026-10-21
Status: accepted
Supersedes: ADR-011 (entry naming and the frontend group)

## Context

ADR-011 grouped consumers into backend / frontend / next entries. Two facts
eroded that grouping within a day:

1. The `frontend` entry's only consumer was the standalone fewbie repo. With
   fewbie-cli absorbed into the newbie monorepo (ADR-012) and linted by the
   monorepo root config, `frontend` has zero consumers.
2. `backend` never described its consumer set accurately — it serves CLIs
   (newbie-cli, fewbie-cli), a code generator (apits), and a source registry
   (newbie-modules), none of which are backends. The earlier rename from
   `nest` to `backend` fixed one inaccuracy and kept another.

Two candidate pairings were considered and rejected:

- `node` + `next`: false symmetry — Node is a runtime, Next is a framework
  that runs on Node; a Next app is a Node app. The real relationship is not
  an environment axis but default vs. specialization (`next` = base layers +
  the Next.js rule set).
- `nest` + `next`: framework-name symmetry, but the entry contains zero
  Nest-specific rules (it is `core` + prettier and nothing else), while its
  consumers include non-Nest tools. A framework name must be backed by
  framework-specific content. If Nest-specific rules are ever adopted, a
  `nest` entry can be added as another specialization alongside `next`.

## Decision

- The default entry is renamed `backend` → `base`: the honest name for a
  config that is the ecosystem default with no framework content.
- The `frontend` entry is deleted, and with it the
  eslint-plugin-react / react-hooks / jsx-a11y dependencies; the `next`
  entry receives those layers from `eslint-config-next`. A future non-Next
  React host would re-add a specialized entry alongside `base`/`next`.
- Released as `@devbie/style-guide@1.2.0` (minor, per the 1.x policy).
- Consumers: the four `base` repos (newbie root, newbie-starter,
  nightwatch-backend, newbie-modules) switch their import and bump the
  devDependency; the two `next` repos (fewbie-starter, nightwatch-frontend)
  need no change.

## Consequences

- The published surface is `prettier`, `eslint/base`, `eslint/next` — each
  name now describes content rather than aspiration.
- Naming test for future entries: an entry earns a framework name only when
  it carries framework-specific rules; everything else lands on `base`.
