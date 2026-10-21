# @devbie/style-guide

Single source of truth for code style across the devbie ecosystem
(newbie / fewbie / nightwatch / apits). See ADR-010 in `worldzhy/newbie`.

## Exports

| Entry                             | Contents                                        |
| --------------------------------- | ----------------------------------------------- |
| `@devbie/style-guide/prettier`    | Canonical prettier config (all repos)           |
| `@devbie/style-guide/eslint/base` | Baseline eslint flat config for Node TypeScript |
| `@devbie/style-guide/eslint/nest` | Nest.js layer (Nest-specific rules, type-aware) |
| `@devbie/style-guide/eslint/next` | Next.js layer (canonical Next.js rules)         |

`nest` and `next` are **layers, not standalone standards**: every consumer
composes `[...base, ...nest]` or `[...base, ...next]`. The baseline carries
the shared language-level rules and prettier; a layer adds only its
framework's rules. `base` alone covers CLIs, code generators, registries, and
SDKs.

## Coverage: which entry each repo uses

| Repo                                | Composition                               |
| ----------------------------------- | ----------------------------------------- |
| newbie-monorepo root                | `base` + `nest` scoped to `packages/core` |
| newbie-starter, nightwatch-backend  | `base` + `nest`                           |
| fewbie-starter, nightwatch-frontend | `base` + `next`                           |
| newbie-modules                      | `base` only                               |

Two structural facts drive this table:

- `newbie-modules` installs no dependencies at all (modules are copied into a
  consumer, not built in place), so it can only use `base`, which is purely
  syntactic.
- The newbie monorepo root lints heterogeneous packages in one config: only
  `packages/core` is Nest framework code, while the CLIs, the generator and
  the SDKs are plain Node. ESLint flat config does not read `package.json` and
  nested `eslint.config.mjs` files are not inherited, so per-package
  differentiation must be expressed in the root config with `files` scoping —
  never with per-package config files or `package.json` entry fields.

`next` (and `nest`) must be loaded where the framework's packages are
installed; `eslint-config-next` requires `next` at load time, and the Nest
layer requires `class-validator` plus a TypeScript project for its four
type-aware rules.

## Usage

### prettier

Delete any local `.prettierrc` and reference the shared config in
`package.json`:

```json
{
  "prettier": "@devbie/style-guide/prettier"
}
```

`.prettierignore` stays repo-local: it lists repo-specific build artifacts,
not style decisions.

### eslint (flat config)

`eslint.config.mjs` in the consumer repo:

```js
import base from "@devbie/style-guide/eslint/base";
// Nest apps:      import nest from "@devbie/style-guide/eslint/nest";
// Next.js apps:   import next from "@devbie/style-guide/eslint/next";

export default [
  ...base,
  // ...nest or ...next, then repo-specific rules and ignores.
];
```

Consumers need `eslint` (^9 or ^10), `prettier` (^3.9.9) and `typescript`
installed as their own dev dependencies (declared as peers of this package).

## Version policy

All devbie packages stay on the 1.x line until the ecosystem launches;
breaking style changes bump minor, not major. Dependency major upgrades of
prettier/eslint follow the ecosystem-wide major-freeze policy: not by
default, only as a deliberate milestone.

## Changelog

- 1.3.1 — the internal `core` entry is inlined into `base` and removed. Nothing
  imported it directly (`base` was its only consumer), and keeping two files
  for one entry set made the loading order harder to read: `nest` and `next`
  each also end on `prettierConfig`, so there is no shared tail to factor out.
- 1.3.0 — new `nest` layer backed by `@darraghor/eslint-plugin-nestjs-typed`
  (recommended flat config, four type-aware rules), and `next` reshaped into a
  layer. Consumers now compose `[...base, ...nest]` / `[...base, ...next]`;
  this also lets the newbie monorepo scope the Nest layer to `packages/core`
  via `files` instead of giving a Nest framework standard to its CLIs.
- 1.2.0 — `backend` renamed to `base` and `frontend` removed. After apits and
  fewbie-cli joined the newbie monorepo (ADR-012/ADR-015), `frontend` had no
  consumer left, and `backend` no longer described its consumers (CLIs, code
  generators, registries — none of them backends). The pair is now named for
  what it is: `base` (the default) and `next` (the Next.js specialization).
  The react/react-hooks/jsx-a11y plugin dependencies are dropped; `next`
  gets those layers from `eslint-config-next`.
- 1.1.3 — `frontend` pins the React version for rule evaluation (19.0) instead
  of detecting it: fewbie lints React template sources without a `react`
  package installed, where detection only emits a warning.
- 1.1.2 — fix: `next` extends `core` plus the canonical Next rule set
  (`eslint-config-next` already bundles React/react-hooks/jsx-a11y, so
  spreading `frontend` on top redefined `jsx-a11y` and flat config rejected
  it). The `frontend` React layer is now scoped to JSX/TSX files, so Node code
  in frontend repos is not evaluated against React rules while React template
  sources are.
- 1.1.1 — fix: `frontend` uses the flat variant of eslint-plugin-react-hooks
  (`configs.flat["recommended-latest"]`); 1.1.0 shipped the legacy shape and
  failed to load under flat config.
- 1.1.0 — entries renamed to `backend` / `frontend` and layered: `core` is
  internal, `frontend` is framework-independent (React rules only), `next`
  adds the canonical Next.js rule set. `nest` was replaced by `backend`.
- 1.0.0 — initial release (`prettier`, `eslint/nest`, `eslint/next`).
