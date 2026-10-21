# @devbie/style-guide

Single source of truth for code style across the devbie ecosystem
(newbie / fewbie / nightwatch / apits). See ADR-010 in `worldzhy/newbie`.

## Exports

| Entry                             | Contents                                            |
| --------------------------------- | --------------------------------------------------- |
| `@devbie/style-guide/prettier`    | Canonical prettier config (all repos)               |
| `@devbie/style-guide/eslint/base` | eslint flat standard for Node TypeScript repos      |
| `@devbie/style-guide/eslint/next` | `base` + canonical Next.js rules (for Next.js apps) |

## Which entry each repo uses

| Repo                                                       | eslint entry |
| ---------------------------------------------------------- | ------------ |
| newbie, newbie-starter, nightwatch-backend, newbie-modules | `base`       |
| fewbie-starter, nightwatch-frontend                        | `next`       |

`base` is the shared default: language-level rules plus prettier, with no
framework content — it serves Nest services, CLIs, code generators, and
source registries alike. `next` is `base`'s baseline plus `eslint-config-next`
(which already bundles the React / react-hooks / jsx-a11y layers), so every
repo shares the same language-level rules while Next.js applications add only
the canonical framework layer. `eslint-config-next` requires the `next`
package at load time, which is why Node repos cannot use `next`.

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
// Next.js apps: import next from "@devbie/style-guide/eslint/next";

export default [
  ...base,
  // Repo-specific rules and ignores go here.
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
