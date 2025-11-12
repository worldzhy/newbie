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
 * 读取配置文件
 */
async function loadConfig() {
  try {
    const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(red('❌ 无法读取配置文件:'), CONFIG_PATH);
    throw error;
  }
}

/**
 * 读取 .env 文件
 */
async function loadEnvFile() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf-8');
    const envVars = {};

    content.split('\n').forEach(line => {
      line = line.trim();

      // 跳过注释和空行
      if (!line || line.startsWith('#')) {
        return;
      }

      // 解析 KEY=VALUE
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
      console.error(red('❌ .env 文件不存在:'), ENV_PATH);
      throw new Error('.env 文件不存在');
    }
    throw error;
  }
}

/**
 * 检查 secret 是否存在
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
 * 获取现有的 secret 值
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
    console.error(red(`❌ 获取现有 secret 失败: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * 创建新的 secret
 */
async function createSecret(client, secretName, secretValue, description) {
  try {
    const command = new CreateSecretCommand({
      Name: secretName,
      Description: description || `由 aws-secrets-push 工具创建`,
      SecretString: JSON.stringify(secretValue, null, 2),
    });
    await client.send(command);
    console.info(green(`  ✓ 创建成功: ${secretName}`));
  } catch (error) {
    console.error(red(`  ✗ 创建失败: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * 更新现有的 secret
 */
async function updateSecret(client, secretName, secretValue) {
  try {
    const command = new UpdateSecretCommand({
      SecretId: secretName,
      SecretString: JSON.stringify(secretValue, null, 2),
    });
    await client.send(command);
    console.info(green(`  ✓ 更新成功: ${secretName}`));
  } catch (error) {
    console.error(red(`  ✗ 更新失败: ${secretName}`), error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  // [step 1] 打印工具介绍
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

  console.info('AWS Secrets Manager 环境变量推送工具');
  console.info(
    '---------------------------------------------------------------'
  );
  console.info('| 将本地 .env 文件的环境变量推送到 AWS Secrets Manager       |');
  console.info('| 支持创建新 secret 或更新现有 secret                         |');
  console.info(
    '---------------------------------------------------------------\n'
  );

  try {
    // [step 2] 读取配置
    const config = await loadConfig();

    // [step 3] 读取 .env 文件
    console.info(cyan('📖 读取本地 .env 文件...\n'));
    const localEnvVars = await loadEnvFile();
    console.info(
      green(`✓ 读取成功，共 ${Object.keys(localEnvVars).length} 个环境变量\n`)
    );

    // [step 4] 选择环境
    const environments = Object.keys(config.environments);
    const selectedEnv = await select({
      message: '请选择要推送到哪个环境:',
      choices: environments.map(env => ({
        name: env === config.defaultEnvironment ? `${env} (默认)` : env,
        value: env,
      })),
      default: config.defaultEnvironment,
    });

    const envConfig = config.environments[selectedEnv];
    console.info(green(`\n✓ 已选择环境: ${bold(selectedEnv)}`));
    console.info(`  Region: ${envConfig.region}\n`);

    // [step 5] 检查 AWS 凭证
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      if (process.env.AWS_PROFILE) {
        console.info(
          cyan(`ℹ️  使用 AWS Profile: ${bold(process.env.AWS_PROFILE)}\n`)
        );
      } else {
        console.info(
          cyan('ℹ️  将使用 AWS CLI 默认配置或 IAM 角色\n')
        );
      }
    }

    // [step 6] 创建 AWS Secrets Manager 客户端
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

    // [step 7] 处理每个 secret 配置
    for (const secretConfig of envConfig.secrets) {
      if (secretConfig.type !== 'json') {
        console.warn(
          yellow(
            `⚠️  跳过 ${secretConfig.name}: 推送功能目前只支持 JSON 类型的 secret`
          )
        );
        continue;
      }

      console.info(cyan(`\n📦 处理 secret: ${bold(secretConfig.name)}`));
      if (secretConfig.description) {
        console.info(`   ${secretConfig.description}`);
      }

      // [step 7-1] 确定要推送的 keys
      let keysToInclude = secretConfig.keys || [];

      if (keysToInclude.length === 0) {
        // 如果配置中没有指定 keys，让用户选择
        console.info(yellow('\n  配置中未指定要推送的 keys，请选择:'));

        const availableKeys = Object.keys(localEnvVars);
        keysToInclude = await checkbox({
          message: `选择要推送到 ${secretConfig.name} 的环境变量:`,
          choices: availableKeys.map(key => ({
            name: `${key} = ${localEnvVars[key].substring(0, 50)}${localEnvVars[key].length > 50 ? '...' : ''}`,
            value: key,
          })),
          pageSize: 15,
        });

        if (keysToInclude.length === 0) {
          console.info(yellow('  - 未选择任何变量，跳过此 secret\n'));
          continue;
        }
      }

      // [step 7-2] 构建要推送的值
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
          yellow(
            `  ⚠️  警告: 以下变量在 .env 中不存在: ${missingKeys.join(', ')}`
          )
        );
      }

      // [step 7-2.5] 处理 keysOnly（只确保 key 存在，不推送值）
      const keysOnly = secretConfig.keysOnly || [];
      const keysOnlyToAdd = {}; // 记录需要添加占位符的 keysOnly

      if (keysOnly.length > 0) {
        console.info(
          cyan(`\n  ℹ️  检测到 ${keysOnly.length} 个 keysOnly 配置（只确保存在，不推送值）`)
        );

        // 检查 secret 是否存在以及是否有这些 keys
        const exists = await secretExists(client, secretConfig.name);
        let existingValue = {};

        if (exists) {
          existingValue = await getExistingSecret(client, secretConfig.name);
        }

        for (const key of keysOnly) {
          if (!existingValue || !existingValue.hasOwnProperty(key)) {
            // Secret 不存在或没有这个 key，添加占位符
            keysOnlyToAdd[key] = '<PLEASE_SET_THIS_VALUE>';
            console.info(
              yellow(`    • ${key}: 将添加占位符（需要手动设置实际值）`)
            );
          } else {
            // Secret 已存在且有这个 key，保持不变
            console.info(cyan(`    • ${key}: 已存在，保持原值`));
          }
        }
      }

      // 合并 valuesToPush 和 keysOnlyToAdd
      Object.assign(valuesToPush, keysOnlyToAdd);

      if (Object.keys(valuesToPush).length === 0 && keysOnly.length === 0) {
        console.warn(yellow('  - 没有可推送的变量，跳过此 secret\n'));
        continue;
      }

      // [step 7-3] 检查 secret 是否存在
      const exists = await secretExists(client, secretConfig.name);

      if (exists) {
        // Secret 存在，获取现有值并对比
        console.info(cyan('  ℹ️  Secret 已存在，正在对比差异...'));
        const existingValue = await getExistingSecret(client, secretConfig.name);

        // 对比差异
        const changes = {added: [], modified: [], unchanged: [], keysOnlyPreserved: []};

        for (const [key, newValue] of Object.entries(valuesToPush)) {
          if (!existingValue || !existingValue.hasOwnProperty(key)) {
            const isPlaceholder = newValue === '<PLEASE_SET_THIS_VALUE>';
            changes.added.push({key, value: newValue, isPlaceholder});
          } else if (existingValue[key] !== newValue) {
            // 如果是占位符但 secret 中已有值，不应该修改
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

        // 显示差异
        if (changes.added.length > 0) {
          console.info(green('\n  新增的变量:'));
          changes.added.forEach(({key, value, isPlaceholder}) => {
            if (isPlaceholder) {
              console.info(
                green(`    + ${key} = ${yellow('<占位符>')} ${cyan('(需要手动设置)')}`)
              );
            } else {
              console.info(
                green(
                  `    + ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`
                )
              );
            }
          });
        }

        if (changes.modified.length > 0) {
          console.info(yellow('\n  修改的变量:'));
          changes.modified.forEach(({key, oldValue, newValue}) => {
            console.info(yellow(`    ~ ${key}`));
            console.info(
              `      旧值: ${oldValue.substring(0, 50)}${oldValue.length > 50 ? '...' : ''}`
            );
            console.info(
              `      新值: ${newValue.substring(0, 50)}${newValue.length > 50 ? '...' : ''}`
            );
          });
        }

        if (changes.keysOnlyPreserved.length > 0) {
          console.info(
            cyan(`\n  保持原值的变量 (keysOnly): ${changes.keysOnlyPreserved.join(', ')}`)
          );
        }

        if (changes.unchanged.length > 0) {
          console.info(
            cyan(`\n  未改变的变量: ${changes.unchanged.join(', ')}`)
          );
        }

        if (changes.added.length === 0 && changes.modified.length === 0) {
          console.info(cyan('  ℹ️  没有变化，跳过更新\n'));
          continue;
        }

        // 确认更新
        const shouldUpdate = await confirm({
          message: `确认更新 ${secretConfig.name}?`,
          default: true,
        });

        if (shouldUpdate) {
          // 合并现有值和新值
          const mergedValue = {...existingValue, ...valuesToPush};
          await updateSecret(client, secretConfig.name, mergedValue);
        } else {
          console.info(yellow('  - 已跳过更新\n'));
        }
      } else {
        // Secret 不存在，创建新的
        console.info(cyan('  ℹ️  Secret 不存在，将创建新的 secret'));

        console.info(green('\n  将要推送的变量:'));
        for (const [key, value] of Object.entries(valuesToPush)) {
          const isPlaceholder = value === '<PLEASE_SET_THIS_VALUE>';
          if (isPlaceholder) {
            console.info(
              green(`    + ${key} = ${yellow('<占位符>')} ${cyan('(需要手动设置)')}`)
            );
          } else {
            console.info(
              green(
                `    + ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`
              )
            );
          }
        }

        const shouldCreate = await confirm({
          message: `确认创建新 secret: ${secretConfig.name}?`,
          default: true,
        });

        if (shouldCreate) {
          await createSecret(
            client,
            secretConfig.name,
            valuesToPush,
            secretConfig.description
          );
        } else {
          console.info(yellow('  - 已跳过创建\n'));
        }
      }
    }

    console.info(bold(green('\n🍺 完成!\n')));
  } catch (error) {
    console.error(red('\n❌ 发生错误:'), error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

// 处理 Ctrl-C
process.on('SIGINT', () => {
  console.info(yellow('\n\n已取消操作\n'));
  process.exit(0);
});
