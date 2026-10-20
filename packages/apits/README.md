# apits-gen

Based on the OpenAPI specification, generate request and response type declarations and request method bodies for APIs

## Installation

`npm install apits-gen`

## Quick start (no config file needed)

Pass an OpenAPI document URL or a local JSON / YAML file:

```bash
apits gen http://localhost:3041/api-json
apits gen ./openapi.yaml -o src/api
```

The `gen` word is optional:

```bash
apits ./openapi.json
```

Each run generates two files in the output directory:

- `<name>.ts` — type declarations and request functions for every API
- `request.ts` — the default axios client (skipped with `--no-client`)

The file name is derived from the input when `-n/--name` is omitted:
`http://localhost:3041/api-json` → `localhost.ts`, `./user.openapi.yaml` →
`userOpenapi.ts`.

### CLI options

| Option | Description | Default |
| --- | --- | --- |
| `input` (positional) | OpenAPI document URL or local `.json` / `.json5` / `.yaml` / `.yml` file | — |
| `-o, --output <path>` | Output directory | `src/api` |
| `-n, --name <name>` | Base name of the generated `<name>.ts`; when using a config file, filters sources by name | derived from the input host / file name |
| `--base-url <url>` | Runtime `baseURL` (supports the `[code]:` prefix) | — |
| `--no-client` | Do not scaffold the default `request.ts` axios client | client is generated |
| `-w, --watch` | Watch a local document and regenerate on change | off |

## Optional configuration file

Create a config only when you need multiple sources, JSON/JSON5 config, or
function-based customization:

```bash
apits init
```

`apits init ./openapi.json` prefills the document address.

The config file is auto-discovered from any of:
`apits.config.local.ts`, `apits.config.ts`, `apits.config.local.json`,
`apits.config.json`, or the `apits` field in `package.json`.

```ts
// apits.config.ts
import { defineConfig } from 'apits-gen'

export default defineConfig([
  {
    input: 'http://localhost:3041/api-json',
    output: 'src/api/user',
    name: 'user', // optional, derived from `input` when omitted
    baseURL: '[code]:process.env.BASE_API_URL',
    clientImportTemplate: () => "import request from './request'",
    client: true
  }
])
```

CLI flags take precedence over config-file values. With a config file,
`-n/--name` selects which source(s) to run.

## Generate from a config file

Once a config file exists, generate all sources with:

```bash
apits gen
```

Or generate a single source by name:

```bash
apits gen -n user
```
