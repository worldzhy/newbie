import { cyan, yellow } from "colorette";

/**
 * Agent entrypoint placeholder.
 *
 * The future protocol: an outbound poller authenticates with
 * NIGHTWATCH_REPORT_ENDPOINT + NIGHTWATCH_APPLICATION_TOKEN, receives apply
 * specs, executes 'newbie apply --ci', and reports status back. Stage 3b only
 * reserves the command surface and validates configuration presence.
 */
const ENDPOINT_ENV = "NIGHTWATCH_REPORT_ENDPOINT";
const TOKEN_ENV = "NIGHTWATCH_APPLICATION_TOKEN";

export async function runAgent(): Promise<void> {
  const endpoint = process.env[ENDPOINT_ENV];
  const token = process.env[TOKEN_ENV];

  if (!endpoint || !token) {
    console.info(
      yellow(
        `Agent protocol is not available yet. Set ${ENDPOINT_ENV} and ${TOKEN_ENV} once the server side ships.`,
      ),
    );
    return;
  }

  console.info(
    cyan(
      `Agent endpoint configured (${endpoint}); polling will be enabled in a later release.`,
    ),
  );
}
