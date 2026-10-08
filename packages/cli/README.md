# @devbie/newbie-cli

[![npm version](https://img.shields.io/npm/v/@devbie/newbie-cli?style=flat-square)](https://www.npmjs.com/package/@devbie/newbie-cli)
[![license](https://img.shields.io/npm/l/@devbie/newbie-cli?style=flat-square)](https://github.com/worldzhy/newbie/blob/dev/LICENSE)
[![node](https://img.shields.io/node/v/@devbie/newbie-cli?style=flat-square)](https://www.npmjs.com/package/@devbie/newbie-cli)

Command-line tool for the [Newbie](https://www.npmjs.com/package/@devbie/newbie)
backend framework. Scaffold new projects, install modules from the
newbie-modules registry, reconcile module copies and project wiring, and load
module-bundled command namespaces (e.g. `newbie secrets`) declared by the
installed modules.

## Requirements

- Node.js `>= 20`

## Installation

Run it directly with `npx`:

```bash
npx @devbie/newbie-cli create my-app
```

Or install it globally:

```bash
npm install -g @devbie/newbie-cli
newbie --help
```

Projects scaffolded from the newbie template already include `@devbie/newbie-cli`
as a dev dependency, so inside those projects you can use `npx newbie …` (or
`npm run newbie -- …`).

## Quick start

```bash
# Scaffold a new project from the basic template
npx @devbie/newbie-cli create my-app

cd my-app
npm install

# Enable/disable modules through an interactive flow (default command)
npx newbie

# Reconcile project files with the enabled module list
npx newbie install
```

## Commands

### Project creation

#### `newbie create <name>`

Scaffold a new project from the basic newbie template.

| Option                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `--template-path <dir>` | Use a local template directory instead of cloning the repository. |
| `--template-ref <ref>`  | Git ref of the newbie repository to clone the template from.      |
| `--no-git-init`         | Skip `git init` in the new project.                               |

### Module management

#### `newbie` (default, interactive)

Interactive module enable/disable flow. Running `newbie` with no command opens
the interactive selector.

#### `newbie install`

Reconcile the project with `modules.json`: copy missing modules, remove extra
ones, and regenerate wiring (Prisma schema, dependencies, environment
requirements).

| Option      | Description                |
| ----------- | -------------------------- |
| `-y, --yes` | Skip confirmation prompts. |

#### `newbie config`

View or edit the enabled-module list in `modules.json` without touching project
files.

| Option                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `--add <modules...>`    | Enable module(s), space or comma separated.  |
| `--remove <modules...>` | Disable module(s), space or comma separated. |
| `--list`                | Print the current configuration.             |

#### `newbie update`

Update enabled module copies to the registry HEAD commit. Local drift blocks the
update unless `--force` is used.

| Option                   | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `--all`                  | Select every module with an available update.            |
| `-y, --yes`              | Skip confirmation prompts.                               |
| `--force`                | Overwrite locally drifted module copies.                 |
| `--keys <moduleKeys...>` | Non-interactive module selector (comma/space separated). |

#### `newbie apply`

Non-interactively sync the module set declared in a JSON spec.

```json
{ "modules": ["module-a", "module-b"] }
```

| Option            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `--config <file>` | Path to the declarative apply spec JSON (required). |
| `--ci`            | CI mode marker (apply is always non-interactive).   |

### Diagnostics

#### `newbie doctor`

Audit the installation: registry pins, copied modules, drift, environment
variables and Prisma wiring.

#### `newbie status`

Print machine-readable project state as JSON.

| Option    | Description                                           |
| --------- | ----------------------------------------------------- |
| `--drift` | Include content drift against pinned pristine copies. |

### Template sync and automation

#### `newbie update-template`

Diff framework-managed skeleton files (`main.ts`, `tsconfig*`, the Prisma
framework block) against the template. Business files are skipped.

| Option                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `--template-path <dir>` | Use a local template directory instead of cloning the repository. |
| `--template-ref <ref>`  | Git ref (e.g. a template tag) to sync from.                       |
| `--write`               | Apply the template version of differing skeleton files.           |

#### `newbie agent`

Run the module-hub agent: poll the hub with `newbie status`, execute dispatched
changes (`apply`/`update`) and report receipts.

| Option   | Description                                                                         |
| -------- | ----------------------------------------------------------------------------------- |
| `--once` | Single pass: drain pending changes, deliver receipts, then exit (CI/cron friendly). |

#### `newbie watch [keys...]`

Watch the local newbie-modules registry and sync installed module sources into
the project on change. Useful for framework/module development.

| Option  | Description                                                 |
| ------- | ----------------------------------------------------------- |
| `--all` | Watch every registry module instead of only installed ones. |

### Registry development

These commands run against the newbie-modules registry itself (inside the
registry checkout, not a consuming project).

#### `newbie dev lint`

Enforce the module layering rules (`domain` -> `capability` -> `foundation`)
across registry sources: upward dependencies and same-layer import cycles are
errors; same-layer dependencies are warnings for review.

### Module-provided commands

Modules can attach their own command namespace to the CLI. When an installed
module's manifest declares `"cli": "<namespace>"`, the CLI loads
`src/modules/<key>/cli/index.ts` at startup and calls its exported
`register(parent, options)` hook to attach subcommands under `newbie <namespace>`.

The module's `cli/index.ts` is typically a thin entry that re-exports the
`register` function from the module's companion npm package, so the
implementation ships versioned through npm instead of being copied into every
project. Example: the `aws-secrets-manager` module declares `"cli": "secrets"`
and pairs with [`@devbie/aws-secrets-cli`](https://www.npmjs.com/package/@devbie/aws-secrets-cli),
providing:

| Command                        | Description                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `newbie secrets pull`          | Pull environment variables from AWS Secrets Manager into `.env`.       |
| `newbie secrets push`          | Push environment variables from `.env` to AWS Secrets Manager.         |
| `newbie secrets deploy-rotation` | Provision the per-account rotation Lambda and print its ARN.         |

Module CLI entries consume shared building blocks (error handling, env-file
parsing, exec helpers, `GlobalOptions`) via the `@devbie/newbie-cli/lib`
export; they never import framework internals by relative path.

## Module manifest

Every registry module carries a `newbie.module.json` at its root:

| Field                | Type            | Description                                                                                  |
| -------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| `key`                | string          | Module key; must match the directory name.                                                   |
| `layer`              | string          | Architectural layer (`domain` / `capability` / `foundation`); absent for framework-specials. |
| `module.file`        | string          | NestJS module file without extension, e.g. `account.module`.                                 |
| `module.className`   | string          | Exported NestJS module class name, e.g. `AccountModule`.                                     |
| `schema`             | string          | Project-relative path of the Prisma model fragment; absent = no models.                      |
| `config-service`     | object          | Config keys merged into the generated `modules.config.ts`.                                   |
| `env`                | object          | Environment variables the module requires (doctor reports missing ones).                     |
| `dependencies`       | object          | npm dependencies merged into the consuming project's `package.json`.                         |
| `devDependencies`    | object          | npm devDependencies merged into the consuming project's `package.json`.                      |
| `moduleDependencies` | string[]        | Registry module keys imported via `@modules/<key>`; installs expand to the transitive closure. |
| `assets`             | object[]        | Extra NestJS assets (e.g. resolvers) wired into the generated module index.                  |
| `cli`                | string          | Command namespace this module exposes (see "Module-provided commands").                      |
| `sdk`                | string          | Package name of the companion SDK shipped alongside the module (pairing record for tooling). |

## Global options

These options can be placed on the root command before or after a subcommand
name:

| Option                   | Description                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| `-C, --cwd <dir>`        | Project root directory (defaults to the current working directory).       |
| `--dry-run`              | Print planned changes without writing files or running mutating commands. |
| `--skip-prisma-generate` | Skip `npx prisma generate` after schema changes.                          |

## Related packages

- [`@devbie/newbie`](https://www.npmjs.com/package/@devbie/newbie) — the Newbie
  backend framework runtime.
- [`@devbie/heartbeat-sdk`](https://www.npmjs.com/package/@devbie/heartbeat-sdk)
  — framework-agnostic installation liveness reporting.
- [`@devbie/aws-secrets-cli`](https://www.npmjs.com/package/@devbie/aws-secrets-cli)
  — companion CLI of the `aws-secrets-manager` module (`newbie secrets`).
- [`@devbie/web-monitor-sdk`](https://www.npmjs.com/package/@devbie/web-monitor-sdk)
  — browser-side web monitoring, companion of the `web-monitor` module.

## License

[MIT](https://github.com/worldzhy/newbie/blob/dev/LICENSE)
