# newbie-template-basic

Backend project skeleton for the [newbie](https://github.com/worldzhy/newbie) framework (NestJS + Prisma). Framework runtime code ships as the `@devbie/newbie` npm package; modules are copied in from the `newbie-modules` registry by the CLI.

## Create a project

```bash
npx @devbie/newbie-cli create my-service
cd my-service
```

`create` copies this template and runs `git init`. Useful flags:

- `--template-ref <ref>` — scaffold from a specific template tag (see Versioning below)
- `--template-path <dir>` — use a local template checkout (offline / development)
- `--no-git-init` — skip `git init`

## Install and start

```bash
npm install
cp .env.example .env        # fill in PRISMA_DATABASE_URL
npx prisma generate
npm run start:dev           # Swagger UI at /api
```

Enable modules from the registry at any time:

```bash
npx newbie                  # interactive enable/disable
npx newbie config --add <module>
npx newbie doctor           # audit wiring / drift / env
```

## Updating the skeleton

The framework-managed skeleton files (`src/main.ts`, `tsconfig*.json`, `nest-cli.json`, `prisma.config.ts`, and the `@@newbie-framework-start/end` block inside `prisma/schema.prisma`) evolve with the template. To pull updates:

```bash
npx newbie update-template            # review a diff against the latest template
npx newbie update-template --write    # apply it (then commit on a branch and open a PR)
```

Business code — `src/application/`, `src/modules/`, your Prisma models outside the marker block, `.env` — is never touched.

## Nightwatch monitoring (optional)

The template ships heartbeat wiring built on `@devbie/heartbeat-sdk` directly in `src/main.ts`. Once the app is listening, it reports liveness to nightwatch every 30s when all three variables are set:

```bash
NIGHTWATCH_APPLICATION_ID=<uuid assigned by nightwatch>
NIGHTWATCH_APPLICATION_TOKEN=<agent token>
NIGHTWATCH_REPORT_ENDPOINT=https://<nightwatch-host>/api/v1
```

With the variables unset the wiring is a silent no-op, so projects not enrolled in nightwatch need no extra setup.

## Versioning

Template releases are tagged on the [newbie repository](https://github.com/worldzhy/newbie) as `template-v<major>.<minor>.<patch>` (e.g. `template-v1.0.0`). Pin a project to a specific release:

```bash
npx @devbie/newbie-cli create my-service --template-ref template-v1.0.0
npx newbie update-template --template-ref template-v1.1.0
```

## License

MIT
