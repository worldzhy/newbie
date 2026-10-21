# Devbie

Devbie is the npm scope (`@devbie/*`) under which the newbie backend framework
and its companion tooling are published. The framework itself is
[NestJS](https://github.com/nestjs/nest)-based: this repository ships its runtime
core, a CLI that assembles installable modules from the
[newbie-modules](https://github.com/worldzhy/newbie-modules) registry into consuming
projects, and companion SDKs.

## Repository layout

This repository is an npm-workspaces monorepo:

| Package                                              | npm name                  | Description                                                                                            |
| ---------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| [packages/newbie](packages/newbie)                   | `@devbie/newbie`          | Runtime library wired into every scaffolded project (bootstrap factory, graceful shutdown, monitoring) |
| [packages/newbie-cli](packages/newbie-cli)           | `@devbie/newbie-cli`      | CLI: scaffold projects, install/update modules from the registry, reconcile wiring, audit drift        |
| [packages/heartbeat-sdk](packages/heartbeat-sdk)     | `@devbie/heartbeat-sdk`   | Framework-agnostic heartbeat client for installation liveness reporting                                |
| [packages/web-monitor-sdk](packages/web-monitor-sdk) | `@devbie/web-monitor-sdk` | Browser-side web monitoring SDK (PV, AJAX, resource, JS error, custom events)                          |

The project template used by `newbie create` lives in the dedicated
[newbie-starter](https://github.com/worldzhy/newbie-starter) repository
(single source of truth, consumed at its root).

The `newbie-modules` registry and the `newbie-starter` / `fewbie-starter`
template repositories stay outside this repository by design: they are a
different artifact class (source-copy registry and template source of truth),
not publishable `@devbie/*` packages.

## CLI

The CLI is the primary entry point. See [packages/newbie-cli/README.md](packages/newbie-cli/README.md)
for installation, the full command reference (`create`, interactive module selection,
`install`, `apply`, `update`, `doctor`, `status`, `watch`, module-bundled command
namespaces) and the `newbie.module.json` manifest format.

Quick start:

```bash
npx @devbie/newbie-cli create my-app
cd my-app && npm install

npx newbie          # interactive module enable/disable (default command)
npx newbie install  # reconcile project files with modules.json
```

## Development

```bash
npm install                      # install workspace dependencies
npm run build:core               # build @devbie/newbie
npm test -w @devbie/newbie-cli   # run CLI tests (node:test)
npm run format                   # prettier across the repo
```

## License

Newbie is [MIT licensed](LICENSE).
