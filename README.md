# Newbie

Newbie is a Node.js backend development framework based on [NestJS](https://github.com/nestjs/nest).
It ships a runtime core, a CLI that assembles installable modules from the
[newbie-modules](https://github.com/worldzhy/newbie-modules) registry into consuming
projects, and companion SDKs.

## Repository layout

This repository is an npm-workspaces monorepo:

| Package                                              | npm name                  | Description                                                                                            |
| ---------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| [packages/cli](packages/cli)                         | `@devbie/newbie-cli`      | CLI: scaffold projects, install/update modules from the registry, reconcile wiring, audit drift        |
| [packages/core](packages/core)                       | `@devbie/newbie`          | Runtime library wired into every scaffolded project (bootstrap factory, graceful shutdown, monitoring) |
| [packages/heartbeat-sdk](packages/heartbeat-sdk)     | `@devbie/heartbeat-sdk`   | Framework-agnostic heartbeat client for installation liveness reporting                                |
| [packages/web-monitor-sdk](packages/web-monitor-sdk) | `@devbie/web-monitor-sdk` | Browser-side web monitoring SDK (PV, AJAX, resource, JS error, custom events)                          |
| [templates/basic](templates/basic)                   | -                         | Project template used by `newbie create`                                                               |

## CLI

The CLI is the primary entry point. See [packages/cli/README.md](packages/cli/README.md)
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
