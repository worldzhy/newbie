const {select, confirm, checkbox} = require('@inquirer/prompts');
const {bold, cyan, green, yellow, red, magenta} = require('colorette');
const figlet = require('figlet');
const fs = require('fs').promises;
const path = require('path');

// AWS SDK
const {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DescribeSecretCommand,
} = require('@aws-sdk/client-secrets-manager');

// Constants
const CONFIG_PATH = path.join(__dirname, '.config', 'aws-secrets.config.json');
const ENV_PATH = path.join(__dirname, '..', '.env');

/**
 * Load configuration file
 */
async function loadConfig() {
  try {
    const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(red('❌ Failed to read config file:'), CONFIG_PATH);
    throw error;
  }
}

/**
 * Load .env file
 */
async function loadEnvFile() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf-8');
    const envVars = {};

    content.split('\n').forEach(line => {
      line = line.trim();

      // Jump empty lines and comments
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

    return envVars;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(red('❌ .env file not found:'), ENV_PATH);
      throw new Error('.env file not found');
    }
    throw error;
  }
}

/**
 * Check if secret exists
 */
async function secretExists(client, secretName) {
  try {
    await client.send(new DescribeSecretCommand({SecretId: secretName}));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

/**
 * Get existing secret value
 */
async function getExistingSecret(client, secretName) {
  try {
    const command = new GetSecretValueCommand({SecretId: secretName});
    const response = await client.send(command);
    return response.SecretString ? JSON.parse(response.SecretString) : {};
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return null;
    }
    console.error(red(`❌ Failed to get existing secret: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * Create new secret
 */
async function createSecret(client, secretName, secretValue, description) {
  try {
    const command = new CreateSecretCommand({
      Name: secretName,
      Description: description || `Created by aws-secrets-push tool`,
      SecretString: JSON.stringify(secretValue, null, 2),
    });
    await client.send(command);
    console.info(green(`  ✓ Created successfully: ${secretName}`));
  } catch (error) {
    console.error(red(`  ✗ Creation failed: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * Update existing secret
 */
async function updateSecret(client, secretName, secretValue) {
  try {
    const command = new UpdateSecretCommand({
      SecretId: secretName,
      SecretString: JSON.stringify(secretValue, null, 2),
    });
    await client.send(command);
    console.info(green(`  ✓ Updated successfully: ${secretName}`));
  } catch (error) {
    console.error(red(`  ✗ Update failed: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // [step 1] Print tool introduction
  console.info(
    magenta(
      figlet.textSync('AWS Push', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      })
    )
  );

  console.info('AWS Secrets Manager Environment Variables Push Tool');
  console.info('---------------------------------------------------------------');
  console.info('| Push local .env file environment variables to AWS Secrets Manager |');
  console.info('| Supports creating new secrets or updating existing ones           |');
  console.info('---------------------------------------------------------------\n');

  try {
    // [step 2] Load configuration
    const config = await loadConfig();

    // [step 3] Load .env file
    console.info(cyan('📖 Reading local .env file...\n'));
    const localEnvVars = await loadEnvFile();
    console.info(green(`✓ Successfully read ${Object.keys(localEnvVars).length} environment variables\n`));

    // [step 4] Select environment
    const environments = Object.keys(config.environments);
    const selectedEnv = await select({
      message: 'Please select the environment to push to:',
      choices: environments.map(env => ({
        name: env === config.defaultEnvironment ? `${env} (default)` : env,
        value: env,
      })),
      default: config.defaultEnvironment,
    });

    const envConfig = config.environments[selectedEnv];
    console.info(green(`\n✓ Selected environment: ${bold(selectedEnv)}`));
    console.info(`  Region: ${envConfig.region}\n`);

    // [step 5] Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      if (process.env.AWS_PROFILE) {
        console.info(cyan(`ℹ️  Using AWS Profile: ${bold(process.env.AWS_PROFILE)}\n`));
      } else {
        console.info(cyan('ℹ️  Using AWS CLI default configuration or IAM role\n'));
      }
    }

    // [step 6] Create AWS Secrets Manager client
    const client = new SecretsManagerClient({
      region: envConfig.region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    // [step 7] Process each secret configuration
    for (const secretConfig of envConfig.secrets) {
      console.info(cyan(`\n📦 Processing secret: ${bold(secretConfig.name)}`));
      if (secretConfig.description) {
        console.info(`   ${secretConfig.description}`);
      }

      // [step 7-1] Determine keys to push
      let keysToInclude = secretConfig.keys || [];

      if (keysToInclude.length === 0) {
        // If keys are not specified in the configuration, let the user choose
        console.info(yellow('\n  Keys to push are not specified in the configuration, please select:'));

        const availableKeys = Object.keys(localEnvVars);
        keysToInclude = await checkbox({
          message: `Select environment variables to push to ${secretConfig.name}:`,
          choices: availableKeys.map(key => ({
            name: `${key} = ${localEnvVars[key].substring(0, 50)}${localEnvVars[key].length > 50 ? '...' : ''}`,
            value: key,
          })),
          pageSize: 15,
        });

        if (keysToInclude.length === 0) {
          console.info(yellow('  - No variables selected, skipping this secret\n'));
          continue;
        }
      }

      // [step 7-2] Build values to push
      const valuesToPush = {};
      const missingKeys = [];

      for (const key of keysToInclude) {
        if (localEnvVars.hasOwnProperty(key)) {
          valuesToPush[key] = localEnvVars[key];
        } else {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        console.warn(
          yellow(`  ⚠️  Warning: The following keys do not exist in the .env file: ${missingKeys.join(', ')}`)
        );
      }

      // [step 7-2.5] Handle keysOnly (ensure key exists, do not push value)
      const keysOnly = secretConfig.keysOnly || [];
      const keysOnlyToAdd = {}; // Record keysOnly that need placeholders

      if (keysOnly.length > 0) {
        console.info(
          cyan(`\n  ℹ️  Detected ${keysOnly.length} keysOnly configurations (ensure existence, do not push values)`)
        );

        // 检查 secret 是否存在以及是否有这些 keys
        const exists = await secretExists(client, secretConfig.name);
        let existingValue = {};

        if (exists) {
          existingValue = await getExistingSecret(client, secretConfig.name);
        }

        for (const key of keysOnly) {
          if (!existingValue || !existingValue.hasOwnProperty(key)) {
            // Secret does not exist or does not have this key, add placeholder
            keysOnlyToAdd[key] = '<PLEASE_SET_THIS_VALUE>';
            console.info(yellow(`    • ${key}: Adding placeholder (manual value required)`));
          } else {
            // Secret exists and has this key, keep unchanged
            console.info(cyan(`    • ${key}: Exists, keeping original value`));
          }
        }
      }

      // Merge valuesToPush and keysOnlyToAdd
      Object.assign(valuesToPush, keysOnlyToAdd);

      if (Object.keys(valuesToPush).length === 0 && keysOnly.length === 0) {
        console.warn(yellow('  - No variables to push, skipping this secret\n'));
        continue;
      }

      // [step 7-3] Check if secret exists
      const exists = await secretExists(client, secretConfig.name);

      if (exists) {
        // Secret exists, get existing values and compare
        console.info(cyan('  ℹ️  Secret exists, comparing differences...'));
        const existingValue = await getExistingSecret(client, secretConfig.name);

        // Compare differences
        const changes = {added: [], modified: [], unchanged: [], keysOnlyPreserved: []};

        for (const [key, newValue] of Object.entries(valuesToPush)) {
          if (!existingValue || !existingValue.hasOwnProperty(key)) {
            const isPlaceholder = newValue === '<PLEASE_SET_THIS_VALUE>';
            changes.added.push({key, value: newValue, isPlaceholder});
          } else if (existingValue[key] !== newValue) {
            // If it's a placeholder but the secret already has a value, do not modify
            if (newValue === '<PLEASE_SET_THIS_VALUE>') {
              changes.keysOnlyPreserved.push(key);
            } else {
              changes.modified.push({
                key,
                oldValue: existingValue[key],
                newValue,
              });
            }
          } else {
            changes.unchanged.push(key);
          }
        }

        // Display differences
        if (changes.added.length > 0) {
          console.info(green('\n  Added variables:'));
          changes.added.forEach(({key, value, isPlaceholder}) => {
            if (isPlaceholder) {
              console.info(green(`    + ${key} = ${yellow('<placeholder>')} ${cyan('(manual setting required)')}`));
            } else {
              console.info(green(`    + ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`));
            }
          });
        }

        if (changes.modified.length > 0) {
          console.info(yellow('\n  Modified variables:'));
          changes.modified.forEach(({key, oldValue, newValue}) => {
            console.info(yellow(`    ~ ${key}`));
            console.info(`      Old value: ${oldValue.substring(0, 50)}${oldValue.length > 50 ? '...' : ''}`);
            console.info(`      New value: ${newValue.substring(0, 50)}${newValue.length > 50 ? '...' : ''}`);
          });
        }

        if (changes.keysOnlyPreserved.length > 0) {
          console.info(cyan(`\n  KeysOnly variables preserved: ${changes.keysOnlyPreserved.join(', ')}`));
        }

        if (changes.unchanged.length > 0) {
          console.info(cyan(`\n  Unchanged variables: ${changes.unchanged.join(', ')}`));
        }

        if (changes.added.length === 0 && changes.modified.length === 0) {
          console.info(cyan('  ℹ️  No changes, skipping update\n'));
          continue;
        }

        // Confirm update
        const shouldUpdate = await confirm({
          message: `Confirm update for ${secretConfig.name}?`,
          default: true,
        });

        if (shouldUpdate) {
          // Merge existing values and new values
          const mergedValue = {...existingValue, ...valuesToPush};
          await updateSecret(client, secretConfig.name, mergedValue);
        } else {
          console.info(yellow('  - Update skipped\n'));
        }
      } else {
        // Secret does not exist, create new
        console.info(cyan('  ℹ️  Secret does not exist, creating new secret'));
        console.info(green('\n  Variables to be pushed:'));
        for (const [key, value] of Object.entries(valuesToPush)) {
          const isPlaceholder = value === '<PLEASE_SET_THIS_VALUE>';
          if (isPlaceholder) {
            console.info(green(`    + ${key} = ${yellow('<placeholder>')} ${cyan('(manual setting required)')}`));
          } else {
            console.info(green(`    + ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`));
          }
        }

        const shouldCreate = await confirm({
          message: `Confirm creation of new secret: ${secretConfig.name}?`,
          default: true,
        });

        if (shouldCreate) {
          await createSecret(client, secretConfig.name, valuesToPush, secretConfig.description);
        } else {
          console.info(yellow('  - Creation skipped\n'));
        }
      }
    }

    console.info(bold(green('\n🍺 Done!\n')));
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
