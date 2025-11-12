const {select, confirm} = require('@inquirer/prompts');
const {bold, cyan, green, yellow, red} = require('colorette');
const figlet = require('figlet');
const fs = require('fs').promises;
const path = require('path');

// AWS SDK
const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager');

// Constants
const CONFIG_PATH = path.join(__dirname, '.config', 'config.json');
const ENV_PATH = path.join(__dirname, '..', '.env');

/**
 * Load configuration file
 */
async function loadConfig() {
  try {
    const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(red('❌ Failed to load configuration file:'), CONFIG_PATH);
    throw error;
  }
}

/**
 * Get secret from AWS Secrets Manager
 */
async function getSecret(client, secretName) {
  try {
    const command = new GetSecretValueCommand({SecretId: secretName});
    const response = await client.send(command);

    if (response.SecretString) {
      return response.SecretString;
    } else {
      // If it's binary data
      const buff = Buffer.from(response.SecretBinary, 'base64');
      return buff.toString('ascii');
    }
  } catch (error) {
    console.error(red(`❌ Failed to get secret: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * Parse secret into environment variable key-value pairs
 */
function parseSecret(secret, secretConfig) {
  const envVars = {}; // Regular environment variables
  const keysOnlyVars = {}; // keysOnly environment variables (added only if not present locally)
  const placeholderKeys = []; // Record keys with placeholders
  const keysOnly = secretConfig.keysOnly || [];

  try {
    const secretData = JSON.parse(secret);

    // If keys are specified, only extract these keys
    if (secretConfig.keys && secretConfig.keys.length > 0) {
      secretConfig.keys.forEach(key => {
        if (secretData.hasOwnProperty(key)) {
          const value = secretData[key];
          envVars[key] = value;
          // Check if it's a placeholder, record it for prompt
          if (value === '<PLEASE_SET_THIS_VALUE>') {
            placeholderKeys.push(key);
          }
        }
      });
    } else {
      // Extract all keys
      Object.keys(secretData).forEach(key => {
        if (secretData.hasOwnProperty(key)) {
          const value = secretData[key];
          envVars[key] = value;
          // Check if it's a placeholder, record it for prompt
          if (value === '<PLEASE_SET_THIS_VALUE>') {
            placeholderKeys.push(key);
          }
        }
      });
    }

    // Handle keysOnly configuration
    if (keysOnly.length > 0) {
      keysOnly.forEach(key => {
        if (secretData.hasOwnProperty(key)) {
          // Move from regular envVars to keysOnlyVars
          if (envVars.hasOwnProperty(key)) {
            delete envVars[key];
          }
          // keysOnly values use placeholder (added only if not present locally)
          keysOnlyVars[key] = '<PLEASE_SET_THIS_VALUE>';
        }
      });
    }
  } catch (error) {
    console.error(red(`❌ Failed to parse JSON secret: ${secretConfig.name}`), error.message);
  }

  return {envVars, keysOnlyVars, placeholderKeys};
}

/**
 * Load existing .env file
 */
async function loadEnvFile() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf-8');
    const envVars = {};

    // Parse .env file
    content.split('\n').forEach(line => {
      line = line.trim();

      // Skip comments and empty lines
      if (!line || line.startsWith('#')) {
        return;
      }

      // Parse 'KEY=VALUE' format
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });

    return {content, envVars};
  } catch (error) {
    if (error.code === 'ENOENT') {
      // .env file does not exist
      return {content: '', envVars: {}};
    }
    throw error;
  }
}

/**
 * Merge environment variables (handle conflicts)
 */
async function mergeEnvVars(existingEnvVars, newEnvVars) {
  const merged = {...existingEnvVars};
  const conflicts = [];

  // Detect conflicts
  for (const [key, newValue] of Object.entries(newEnvVars)) {
    if (existingEnvVars.hasOwnProperty(key)) {
      const existingValue = existingEnvVars[key];
      if (existingValue !== newValue) {
        conflicts.push({key, existingValue, newValue});
      }
    }
  }

  // Handle conflicts
  if (conflicts.length > 0) {
    console.info(yellow('\n⚠️  The following environment variable conflicts were found:\n'));

    for (const conflict of conflicts) {
      console.info(cyan(`  ${conflict.key}:`));
      console.info(`    Local value: ${conflict.existingValue}`);
      console.info(`    AWS value:  ${conflict.newValue}`);

      const shouldOverwrite = await confirm({
        message: `Overwrite ${conflict.key} with AWS value?`,
        default: false,
      });

      if (shouldOverwrite) {
        merged[conflict.key] = conflict.newValue;
        console.info(green(`  ✓ Overwritten ${conflict.key}\n`));
      } else {
        console.info(yellow(`  - Kept local value for ${conflict.key}\n`));
      }
    }
  }

  // Add new environment variables
  for (const [key, value] of Object.entries(newEnvVars)) {
    if (!existingEnvVars.hasOwnProperty(key)) {
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * Write merged environment variables to .env file
 */
async function writeEnvFile(envVars) {
  // Generate .env content
  const lines = [];

  for (const [key, value] of Object.entries(envVars)) {
    lines.push(`${key}=${value}`);
  }

  const content = lines.join('\n') + '\n';

  try {
    await fs.writeFile(ENV_PATH, content, 'utf-8');
    console.info(green(`\n✓ Updated .env file: ${ENV_PATH}`));
  } catch (error) {
    console.error(red('❌ Failed to write .env file:'), error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // [step 1] Print tool introduction
  console.info(
    cyan(
      figlet.textSync('AWS Secrets', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      })
    )
  );

  console.info('AWS Secrets Manager environment variable pull tool');
  console.info('---------------------------------------------------------------');
  console.info('| Pull environment variables from AWS Secrets Manager to local .env file |');
  console.info('| Supports multi-environment configuration, JSON/string formats, interactive conflict handling |');
  console.info('---------------------------------------------------------------\n');

  try {
    // [step 2] Load configuration
    const config = await loadConfig();

    // [step 3] Select environment
    const environments = Object.keys(config.environments);
    const selectedEnv = await select({
      message: 'Select environment to pull:',
      choices: environments.map(env => ({
        name: env === config.defaultEnvironment ? `${env} (default)` : env,
        value: env,
      })),
      default: config.defaultEnvironment,
    });

    const envConfig = config.environments[selectedEnv];
    console.info(green(`\n✓ Selected environment: ${bold(selectedEnv)}`));
    console.info(`  Region: ${envConfig.region}\n`);

    // [step 4] Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      if (process.env.AWS_PROFILE) {
        console.info(cyan(`ℹ️  Using AWS Profile: ${bold(process.env.AWS_PROFILE)}\n`));
      } else {
        console.info(cyan('ℹ️  No AWS environment variables detected, will use the following credential sources:'));
        console.info(cyan('   1. AWS SSO (recommended): run aws sso login --profile <profile> first'));
        console.info(cyan('   2. AWS CLI default configuration (~/.aws/credentials)'));
        console.info(cyan('   3. EC2/ECS IAM roles (only within AWS services)\n'));
      }
    }

    // [step 5] Create AWS Secrets Manager client
    const client = new SecretsManagerClient({
      region: envConfig.region,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });

    // [step 6] Pull all secrets
    console.info(cyan('📥 Starting to pull secrets...\n'));
    const allEnvVars = {};
    const allKeysOnlyVars = {}; // Collect all keysOnly variables
    const allPlaceholderKeys = []; // Collect all placeholders
    const allKeysOnlyKeys = []; // Collect all keysOnly keys
    for (const secretConfig of envConfig.secrets) {
      try {
        console.info(`  Pulling: ${secretConfig.name}`);
        if (secretConfig.description) {
          console.info(`    ${secretConfig.description}`);
        }

        const secretValue = await getSecret(client, secretConfig.name);
        const {envVars, keysOnlyVars, placeholderKeys} = parseSecret(secretValue, secretConfig);

        Object.assign(allEnvVars, envVars);
        Object.assign(allKeysOnlyVars, keysOnlyVars);

        // Collect keysOnly variables
        if (Object.keys(keysOnlyVars).length > 0) {
          const keysOnlyKeys = Object.keys(keysOnlyVars);
          allKeysOnlyKeys.push(...keysOnlyKeys);
          console.info(
            cyan(`    ℹ️  keysOnly configuration (added only if not present locally): ${keysOnlyKeys.join(', ')}`)
          );
        }

        // Collect placeholders
        if (placeholderKeys.length > 0) {
          allPlaceholderKeys.push(...placeholderKeys);
          console.info(yellow(`    ⚠️  Detected placeholders (need manual setting): ${placeholderKeys.join(', ')}`));
        }

        console.info(green(`    ✓ Success (${Object.keys(envVars).length} variables)\n`));
      } catch (error) {
        console.error(red(`    ✗ Failure: ${error.message}\n`));
        // Continue processing other secrets
      }
    }

    if (Object.keys(allEnvVars).length === 0 && Object.keys(allKeysOnlyVars).length === 0) {
      console.info(yellow('\n⚠️  No environment variables were pulled from AWS Secrets Manager.\n'));
      return;
    }

    console.info(green(`\n✓ Pulled a total of ${Object.keys(allEnvVars).length} environment variables`));
    // [step 7] Load existing .env file
    const {envVars: existingEnvVars} = await loadEnvFile();

    // [step 8] Merge environment variables
    const mergedEnvVars = await mergeEnvVars(existingEnvVars, allEnvVars);

    // [step 8.5] Handle keysOnly variables (add only if not present locally)
    const addedKeysOnlyKeys = [];
    const skippedKeysOnlyKeys = [];

    for (const [key, value] of Object.entries(allKeysOnlyVars)) {
      if (!existingEnvVars.hasOwnProperty(key)) {
        // Not present locally, add placeholder
        mergedEnvVars[key] = value;
        addedKeysOnlyKeys.push(key);
      } else {
        // Present locally, keep local value
        skippedKeysOnlyKeys.push(key);
      }
    }

    if (addedKeysOnlyKeys.length > 0) {
      console.info(
        green(
          `\n✓ Added ${addedKeysOnlyKeys.length} keysOnly variables (placeholders): ${addedKeysOnlyKeys.join(', ')}`
        )
      );
    }

    if (skippedKeysOnlyKeys.length > 0) {
      console.info(cyan(`\nℹ️  Kept local values for keysOnly variables: ${skippedKeysOnlyKeys.join(', ')}`));
    }

    // [step 9] Write to .env file
    const shouldWrite = await confirm({
      message: 'Write environment variables to .env file?',
      default: true,
    });

    if (shouldWrite) {
      await writeEnvFile(mergedEnvVars);

      // Show placeholder warnings (including regular placeholders and keysOnly placeholders)
      const allPlaceholderKeysToShow = [...new Set([...allPlaceholderKeys, ...addedKeysOnlyKeys])];

      if (allPlaceholderKeysToShow.length > 0) {
        console.info(
          yellow(
            '\n⚠️  The following environment variables are placeholders <PLEASE_SET_THIS_VALUE>, written to .env, need manual modification:'
          )
        );
        allPlaceholderKeysToShow.forEach(key => {
          const isKeysOnly = allKeysOnlyKeys.includes(key);
          if (isKeysOnly) {
            console.info(yellow(`   • ${key} ${cyan('(keysOnly configuration)')}`));
          } else {
            console.info(yellow(`   • ${key}`));
          }
        });
        console.info(cyan('\nTips:'));
        console.info(cyan('   1. Edit the local .env file directly to replace placeholders with actual values'));
        console.info(cyan('   2. Or set them in the AWS Console and pull again'));
        console.info(
          cyan(`      aws secretsmanager update-secret --secret-id <secret-name> --secret-string '{...}'\n`)
        );
      }

      console.info(bold(green('🍺 Done!\n')));
    } else {
      console.info(yellow('\nWrite cancelled\n'));
    }
  } catch (error) {
    console.error(red('\n❌ Error occurred:'), error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

// Handle Ctrl-C
process.on('SIGINT', () => {
  console.info(yellow('\n\nOperation cancelled\n'));
  process.exit(0);
});
