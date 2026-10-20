import fs from "node:fs/promises";
import path from "node:path";

import { bold, cyan, green, red, yellow } from "colorette";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

import { CliError, ENV_EXAMPLE_PATH, envValues, parseEnv } from "@devbie/newbie-cli/lib";

import { createAwsClient, pickEnvironment, printCredentialHint } from "./pull-push";
import { assertExpectedAccount, getCallerIdentity } from "./aws-identity";
import { readEnvToolConfig } from "./env-tool-config";
import type { GlobalOptions } from "@devbie/newbie-cli/lib";

export interface SecretsCheckOptions extends GlobalOptions {
  environment?: string;
}

/**
 * Verify that every environment variable declared in `.env.example` exists in
 * the AWS Secrets Manager secret for the selected environment.
 *
 * `.env.example` is the single source of truth for which env vars the code
 * expects (module env configs are assembled into it by the newbie CLI). A
 * missing key means a deploy would silently ship a broken runtime (e.g. an
 * unset `LARK_VERIFICATION_TOKEN` making every webhook 503). The guard fails
 * the build before an image is pushed.
 *
 * Exit code: 0 when all declared keys are present; 1 when any are missing.
 */
export async function runSecretsCheck(options: SecretsCheckOptions): Promise<void> {
  const { config: toolConfig } = await readEnvToolConfig(options.cwd);
  const envName = await pickEnvironment(toolConfig, options.environment);
  const envConfig = toolConfig.environments[envName];
  printCredentialHint();

  if (envConfig.expectedAccountId) {
    assertExpectedAccount(await getCallerIdentity(envConfig.region), envConfig.expectedAccountId);
  }

  const examplePath = path.resolve(options.cwd, ENV_EXAMPLE_PATH);
  let raw: string;
  try {
    raw = await fs.readFile(examplePath, "utf8");
  } catch {
    throw new CliError(`${ENV_EXAMPLE_PATH} not found; nothing to check.`);
  }

  const declared = envValues(parseEnv(raw));
  const declaredKeys = Object.keys(declared).sort();
  if (declaredKeys.length === 0) {
    throw new CliError(`${ENV_EXAMPLE_PATH} declares no variables; check the file.`);
  }

  console.info(cyan(`🔍 Checking ${declaredKeys.length} declared variable(s) against AWS Secrets Manager...\n`));

  const client: SecretsManagerClient = createAwsClient(envConfig.region);
  const secretKeys = new Set<string>();

  for (const secretConfig of envConfig.secrets) {
    try {
      const response = await client.send(new GetSecretValueCommand({ SecretId: secretConfig.name }));
      const secretString = response.SecretString ?? new TextDecoder().decode(response.SecretBinary ?? new Uint8Array());
      const data = JSON.parse(secretString) as Record<string, unknown>;
      for (const key of Object.keys(data)) secretKeys.add(key);
      console.info(green(`  ✓ ${secretConfig.name} (${Object.keys(data).length} keys)`));
    } catch (error) {
      throw new CliError(`Failed to read secret '${secretConfig.name}': ${(error as Error).message}`);
    }
  }

  const missing = declaredKeys.filter((key) => !secretKeys.has(key));
  if (missing.length > 0) {
    console.error(red(`\n❌ ${missing.length} declared variable(s) missing from Secrets Manager:\n`));
    for (const key of missing) {
      console.error(red(`  - ${key}`));
    }
    console.error(yellow(`\nAdd the missing key(s) to the AWS secret, then re-run \`newbie secrets check\`.`));
    console.error(yellow(`Secrets checked: ${envConfig.secrets.map((s) => s.name).join(", ")}`));
    throw new CliError(`${missing.length} declared variable(s) missing from Secrets Manager`);
  }

  console.info(bold(green(`\n🍺 All ${declaredKeys.length} declared variable(s) are present in Secrets Manager.\n`)));
}
