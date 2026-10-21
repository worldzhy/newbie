# @devbie/style-guide

Single source of truth for code style across the devbie ecosystem
(newbie / fewbie / nightwatch). See ADR-010 in `worldzhy/newbie`.

## Exports

| Entry                             | Contents                                              |
| --------------------------------- | ----------------------------------------------------- |
| `@devbie/style-guide/prettier`    | Canonical prettier config                             |
| `@devbie/style-guide/eslint/nest` | eslint flat config for Nest/Node TypeScript codebases |
| `@devbie/style-guide/eslint/next` | eslint flat config for Next.js codebases              |

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
import nest from "@devbie/style-guide/eslint/nest";
// or: import next from "@devbie/style-guide/eslint/next";

export default [
  ...next,
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
