# @devbie/heartbeat-sdk

[![npm version](https://img.shields.io/npm/v/@devbie/heartbeat-sdk?style=flat-square)](https://www.npmjs.com/package/@devbie/heartbeat-sdk)
[![license](https://img.shields.io/npm/l/@devbie/heartbeat-sdk?style=flat-square)](https://github.com/worldzhy/newbie/blob/dev/LICENSE)
[![node](https://img.shields.io/node/v/@devbie/heartbeat-sdk?style=flat-square)](https://www.npmjs.com/package/@devbie/heartbeat-sdk)

A tiny, framework-agnostic heartbeat client for installation liveness
reporting. Start it in any Node.js application and it will POST a ping to your
heartbeat server immediately and then on a fixed interval.

- **Zero runtime dependencies** — uses the global `fetch` available in Node.js
  18 and later.
- **Idempotent singleton** — calling `startHeartbeat()` twice returns the
  existing handle, so duplicate imports are safe.
- **Non-intrusive** — the interval timer is `unref()`-ed so it never keeps the
  process alive, and network failures are silently swallowed.

## Requirements

- Node.js `>= 18`

## Installation

```bash
npm install @devbie/heartbeat-sdk
```

## Usage

```ts
import { startHeartbeat } from "@devbie/heartbeat-sdk";

const heartbeat = startHeartbeat({
  endpoint: "https://heartbeat.example.com",
  token: process.env.HEARTBEAT_TOKEN!,
  appVersion: "1.4.2",
  env: "prod",
  instanceId: "ip-172-31-0-1",
});

// Later, if needed:
heartbeat.stop();
```

## Options

`startHeartbeat(options)` takes the following configuration:

| Option       | Type     | Default | Required | Description                                                                  |
| ------------ | -------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `endpoint`   | `string` | —       | Yes      | Heartbeat server endpoint prefix, without a trailing slash.                  |
| `token`      | `string` | —       | Yes      | Installation token, sent as the `X-Heartbeat-Token` header; globally unique. |
| `intervalMs` | `number` | `30000` | No       | Heartbeat interval in milliseconds.                                          |
| `appVersion` | `string` | —       | No       | Deployed application version (git SHA or semver), self-reported.             |
| `env`        | `string` | —       | No       | Self-reported deployment environment, e.g. `prod`.                           |
| `instanceId` | `string` | —       | No       | Self-reported instance identifier (hostname, EC2 instance ID, ...).          |

The returned `HeartbeatHandle` exposes:

| Method   | Description                                               |
| -------- | --------------------------------------------------------- |
| `stop()` | Stop the heartbeat loop and release the global singleton. |

## Server contract

Each tick issues an HTTP request:

```
POST {endpoint}/heartbeat/ping
X-Heartbeat-Token: {token}
Content-Type: application/json
```

The JSON body is omitted entirely when no optional metadata is supplied;
otherwise it contains only the provided fields:

```json
{
  "appVersion": "1.4.2",
  "env": "prod",
  "instanceId": "ip-172-31-0-1"
}
```

Because the installation token is globally unique, the server resolves the
installation from the `X-Heartbeat-Token` header alone.

## Framework integrations

The SDK is framework-agnostic, but it is wired automatically into the project
templates of the Devbie frameworks, gated behind two environment variables so
unenrolled projects get a safe no-op:

- **Newbie (NestJS) template** — `main.ts` starts the heartbeat when
  `HEARTBEAT_ENDPOINT` and `HEARTBEAT_TOKEN` are set.
- **Fewbie (Next.js) template** — `instrumentation.ts` dynamically imports and
  starts it in the Node.js runtime only.

```ts
import { startHeartbeat } from "@devbie/heartbeat-sdk";

const endpoint = process.env.HEARTBEAT_ENDPOINT;
const token = process.env.HEARTBEAT_TOKEN;
if (endpoint && token) {
  startHeartbeat({ endpoint, token });
}
```

## Related packages

- [`@devbie/newbie`](https://www.npmjs.com/package/@devbie/newbie) — Newbie
  backend framework runtime.
- [`@devbie/newbie-cli`](https://www.npmjs.com/package/@devbie/newbie-cli) —
  Newbie framework command-line tool.
- [`@devbie/web-monitor-sdk`](https://www.npmjs.com/package/@devbie/web-monitor-sdk)
  — browser-side web monitoring.

## License

[MIT](https://github.com/worldzhy/newbie/blob/dev/LICENSE)
