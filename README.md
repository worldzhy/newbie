# @devbie/fewbie-cli

[![npm version](https://img.shields.io/npm/v/@devbie/fewbie-cli?style=flat-square)](https://www.npmjs.com/package/@devbie/fewbie-cli)
[![license](https://img.shields.io/npm/l/@devbie/fewbie-cli?style=flat-square)](https://github.com/worldzhy/fewbie/blob/dev/LICENSE)
[![node](https://img.shields.io/node/v/@devbie/fewbie-cli?style=flat-square)](https://www.npmjs.com/package/@devbie/fewbie-cli)

Command-line tool for the Fewbie frontend framework. Scaffold Next.js projects
from the Fewbie basic template, add business components and logic utilities
from a shadcn-compatible registry, and generate typed API request code from
OpenAPI documents.

The generated projects use **Next.js 16 (App Router), React 19 and Tailwind
CSS v4**, with shadcn-style UI primitives and design tokens already wired up.

## Requirements

- Node.js `>= 20`

## Installation

Run it directly with `npx`:

```bash
npx @devbie/fewbie-cli init my-app
```

Or install it globally:

```bash
npm install -g @devbie/fewbie-cli
fewbie --help
```

## Quick start

```bash
# Scaffold a new project
npx @devbie/fewbie-cli init my-app

cd my-app
npm install
npm run dev

# Add registry components and utilities (dependencies installed automatically)
npx fewbie add api-client auth
npx fewbie add data-table
```

## Commands

### `fewbie init <project-name>`

Create a new project from the Fewbie basic template.

| Option               | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `--template-path <dir>` | Use a local template directory instead of cloning the repository. |
| `--template-ref <ref>`  | Git ref of the fewbie repository to clone the template from.     |
| `--no-git-init`         | Skip `git init` in the new project.                              |

### `fewbie add <names...>`

Add one or more components or logic utilities from the Fewbie registry.
Registry dependencies are resolved automatically (e.g. `login-form` pulls in
`auth`, which pulls in `api-client`), and missing npm dependencies are
installed automatically.

| Option               | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `-f, --force`        | Overwrite files that already exist.                                        |
| `--skip-install`     | Do not run `npm install` for missing dependencies.                         |
| `--with-login-form`  | Also install the login-form block, e.g. `fewbie add auth --with-login-form`. |

### `fewbie gen api [input]`

Generate typed API request code from an OpenAPI document (a URL or a local
JSON/YAML file). On the first run the command scaffolds `apits.config.ts`;
subsequent runs generate the typed request layer via the apits generator.

| Option             | Description                                                          |
| ------------------ | ------------------------------------------------------------------- |
| `-n, --name <name>` | Only generate the config source with this name.                    |
| `-w, --watch`      | Watch a local OpenAPI document and regenerate on change.            |
| `--skip-install`   | Do not install the generator dev dependency.                        |

### `fewbie doctor`

Check project health: structure, installed registry items, dependencies,
design tokens and AI-readability.

| Option   | Description                    |
| -------- | ------------------------------ |
| `--json` | Emit machine-readable JSON.    |

### `fewbie update [names...]`

Show updates for installed registry items as a unified diff. Pass `--write` to
apply the changes instead of only previewing them.

| Option     | Description                                              |
| ---------- | -------------------------------------------------------- |
| `-w, --write` | Apply the updates instead of only printing diffs.     |

## Registry items

The built-in registry follows the shadcn item conventions
(`registry:lib`, `registry:component`, `registry:block`):

| Item                      | Type      | Description                                                                 |
| ------------------------- | --------- | --------------------------------------------------------------------------- |
| `api-client`              | `lib`     | Axios instance with bearer-token auth, httpOnly refresh-cookie rotation, single-flight 401 retry and proactive token refresh. |
| `auth`                    | `lib`     | Login/logout helpers, session-expired redirect binding and proactive-refresh bootstrap built on the api-client. |
| `data-table`              | `component` | Generic data table with client-side sorting and pagination.              |
| `login-form`              | `block`   | Account/password login card; submits through the auth util and honors `?redirect=`. |
| `page-header`             | `component` | Standard page header with title, description and a right-aligned actions slot. |
| `settings-required-state` | `block`   | Empty state shown when required configuration is missing, with a setup call-to-action. |
| `theme`                   | `component` | `next-themes` ThemeProvider wrapper and a light/dark toggle button.      |
| `web-monitor-sdk`         | `component` | Browser-side monitoring (PV/AJAX/resource/errors) via `@devbie/web-monitor-sdk`; scaffolds a client component for the root layout. |

## Global options

| Option            | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| `-C, --cwd <dir>` | Project root directory (defaults to the current working directory). |

Running `fewbie` with no arguments prints help and exits successfully.

## Related packages

- [`@devbie/heartbeat-sdk`](https://www.npmjs.com/package/@devbie/heartbeat-sdk)
  — the basic template reports application liveness through `instrumentation.ts`
  when `HEARTBEAT_ENDPOINT` and `HEARTBEAT_TOKEN` are configured.
- [`@devbie/web-monitor-sdk`](https://www.npmjs.com/package/@devbie/web-monitor-sdk)
  — browser-side monitoring SDK available as the `web-monitor-sdk` registry item.

## License

[MIT](https://github.com/worldzhy/fewbie/blob/dev/LICENSE)
