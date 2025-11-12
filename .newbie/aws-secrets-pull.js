const {select, confirm} = require('@inquirer/prompts');
const {bold, cyan, green, yellow, red} = require('colorette');
const figlet = require('figlet');
const fs = require('fs').promises;
const path = require('path');

// AWS SDK
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

// Constants
const CONFIG_PATH = path.join(__dirname, '.config', 'aws-secrets.config.json');
const ENV_PATH = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

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
 * 从 AWS Secrets Manager 获取 secret
 */
async function getSecret(client, secretName) {
  try {
    const command = new GetSecretValueCommand({SecretId: secretName});
    const response = await client.send(command);

    if (response.SecretString) {
      return response.SecretString;
    } else {
      // 如果是二进制数据
      const buff = Buffer.from(response.SecretBinary, 'base64');
      return buff.toString('ascii');
    }
  } catch (error) {
    console.error(
      red(`❌ 获取 secret 失败: ${secretName}`),
      error.message
    );
    throw error;
  }
}

/**
 * 解析 secret 为环境变量键值对
 */
function parseSecret(secret, secretConfig) {
  const envVars = {}; // 普通环境变量
  const keysOnlyVars = {}; // keysOnly 的环境变量（只在本地不存在时添加）
  const placeholderKeys = []; // 记录占位符的 keys
  const keysOnly = secretConfig.keysOnly || [];

  if (secretConfig.type === 'json') {
    // JSON 格式
    try {
      const secretData = JSON.parse(secret);

      // 如果指定了 keys，只提取这些 key
      if (secretConfig.keys && secretConfig.keys.length > 0) {
        secretConfig.keys.forEach(key => {
          if (secretData.hasOwnProperty(key)) {
            const value = secretData[key];
            envVars[key] = value;
            // 检查是否为占位符，记录下来用于提示
            if (value === '<PLEASE_SET_THIS_VALUE>') {
              placeholderKeys.push(key);
            }
          }
        });
      } else {
        // 提取所有 key
        Object.keys(secretData).forEach(key => {
          if (secretData.hasOwnProperty(key)) {
            const value = secretData[key];
            envVars[key] = value;
            // 检查是否为占位符，记录下来用于提示
            if (value === '<PLEASE_SET_THIS_VALUE>') {
              placeholderKeys.push(key);
            }
          }
        });
      }

      // 处理 keysOnly 配置
      if (keysOnly.length > 0) {
        keysOnly.forEach(key => {
          if (secretData.hasOwnProperty(key)) {
            // 从普通 envVars 移到 keysOnlyVars
            if (envVars.hasOwnProperty(key)) {
              delete envVars[key];
            }
            // keysOnly 的值用占位符（本地不存在时才添加）
            keysOnlyVars[key] = '<PLEASE_SET_THIS_VALUE>';
          }
        });
      }
    } catch (error) {
      console.error(
        red(`❌ 解析 JSON secret 失败: ${secretConfig.name}`),
        error.message
      );
    }
  } else if (secretConfig.type === 'string') {
    // 字符串格式
    const envKey = secretConfig.envKey || secretConfig.name;
    envVars[envKey] = secret;
    // 检查是否为占位符，记录下来用于提示
    if (secret === '<PLEASE_SET_THIS_VALUE>') {
      placeholderKeys.push(envKey);
    }
  }

  return {envVars, keysOnlyVars, placeholderKeys};
}

/**
 * 读取现有的 .env 文件
 */
async function loadEnvFile() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf-8');
    const envVars = {};

    // 解析 .env 文件
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

    return {content, envVars};
  } catch (error) {
    if (error.code === 'ENOENT') {
      // .env 文件不存在
      return {content: '', envVars: {}};
    }
    throw error;
  }
}

/**
 * 合并环境变量（处理冲突）
 */
async function mergeEnvVars(existingEnvVars, newEnvVars) {
  const merged = {...existingEnvVars};
  const conflicts = [];

  // 检测冲突
  for (const [key, newValue] of Object.entries(newEnvVars)) {
    if (existingEnvVars.hasOwnProperty(key)) {
      const existingValue = existingEnvVars[key];
      if (existingValue !== newValue) {
        conflicts.push({key, existingValue, newValue});
      }
    }
  }

  // 处理冲突
  if (conflicts.length > 0) {
    console.info(yellow('\n⚠️  发现以下环境变量冲突:\n'));

    for (const conflict of conflicts) {
      console.info(cyan(`  ${conflict.key}:`));
      console.info(`    本地值: ${conflict.existingValue}`);
      console.info(`    AWS 值:  ${conflict.newValue}`);

      const shouldOverwrite = await confirm({
        message: `是否用 AWS 的值覆盖 ${conflict.key}?`,
        default: false,
      });

      if (shouldOverwrite) {
        merged[conflict.key] = conflict.newValue;
        console.info(green(`  ✓ 已覆盖 ${conflict.key}\n`));
      } else {
        console.info(yellow(`  - 保留本地值 ${conflict.key}\n`));
      }
    }
  }

  // 添加新的环境变量
  for (const [key, value] of Object.entries(newEnvVars)) {
    if (!existingEnvVars.hasOwnProperty(key)) {
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * 写入 .env 文件
 */
async function writeEnvFile(envVars) {
  // 生成 .env 内容
  const lines = [];

  for (const [key, value] of Object.entries(envVars)) {
    lines.push(`${key}=${value}`);
  }

  const content = lines.join('\n') + '\n';

  try {
    await fs.writeFile(ENV_PATH, content, 'utf-8');
    console.info(green(`\n✓ 已更新 .env 文件: ${ENV_PATH}`));
  } catch (error) {
    console.error(red('❌ 写入 .env 文件失败:'), error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  // [step 1] 打印工具介绍
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

  console.info('AWS Secrets Manager 环境变量拉取工具');
  console.info(
    '---------------------------------------------------------------'
  );
  console.info('| 从 AWS Secrets Manager 拉取环境变量到本地 .env 文件        |');
  console.info('| 支持多环境配置、JSON/字符串格式、交互式冲突处理             |');
  console.info(
    '---------------------------------------------------------------\n'
  );

  try {
    // [step 2] 读取配置
    const config = await loadConfig();

    // [step 3] 选择环境
    const environments = Object.keys(config.environments);
    const selectedEnv = await select({
      message: '请选择要拉取的环境:',
      choices: environments.map(env => ({
        name: env === config.defaultEnvironment ? `${env} (默认)` : env,
        value: env,
      })),
      default: config.defaultEnvironment,
    });

    const envConfig = config.environments[selectedEnv];
    console.info(green(`\n✓ 已选择环境: ${bold(selectedEnv)}`));
    console.info(`  Region: ${envConfig.region}\n`);

    // [step 4] 检查 AWS 凭证
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
      if (process.env.AWS_PROFILE) {
        console.info(
          cyan(`ℹ️  使用 AWS Profile: ${bold(process.env.AWS_PROFILE)}\n`)
        );
      } else {
        console.info(
          cyan('ℹ️  未检测到 AWS 环境变量，将使用以下凭证来源:')
        );
        console.info(
          cyan('   1. AWS SSO (推荐): 先运行 aws sso login --profile <profile>')
        );
        console.info(
          cyan('   2. AWS CLI 默认配置 (~/.aws/credentials)')
        );
        console.info(
          cyan('   3. EC2/ECS IAM 角色 (仅在 AWS 服务中)\n')
        );
      }
    }

    // [step 5] 创建 AWS Secrets Manager 客户端
    const client = new SecretsManagerClient({
      region: envConfig.region,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });

    // [step 6] 拉取所有 secrets
    console.info(cyan('📥 开始拉取 secrets...\n'));
    const allEnvVars = {};
    const allKeysOnlyVars = {}; // 收集所有 keysOnly 变量
    const allPlaceholderKeys = []; // 收集所有占位符
    const allKeysOnlyKeys = []; // 收集所有 keysOnly 的 keys

    for (const secretConfig of envConfig.secrets) {
      try {
        console.info(`  拉取: ${secretConfig.name}`);
        if (secretConfig.description) {
          console.info(`    ${secretConfig.description}`);
        }

        const secretValue = await getSecret(client, secretConfig.name);
        const {envVars, keysOnlyVars, placeholderKeys} = parseSecret(secretValue, secretConfig);

        Object.assign(allEnvVars, envVars);
        Object.assign(allKeysOnlyVars, keysOnlyVars);

        // 记录 keysOnly
        if (Object.keys(keysOnlyVars).length > 0) {
          const keysOnlyKeys = Object.keys(keysOnlyVars);
          allKeysOnlyKeys.push(...keysOnlyKeys);
          console.info(
            cyan(`    ℹ️  keysOnly 配置（仅本地不存在时添加）: ${keysOnlyKeys.join(', ')}`)
          );
        }

        // 记录占位符
        if (placeholderKeys.length > 0) {
          allPlaceholderKeys.push(...placeholderKeys);
          console.info(
            yellow(`    ⚠️  检测到占位符（需要手动设置）: ${placeholderKeys.join(', ')}`)
          );
        }

        console.info(
          green(`    ✓ 成功 (${Object.keys(envVars).length} 个变量)\n`)
        );
      } catch (error) {
        console.error(
          red(`    ✗ 失败: ${error.message}\n`)
        );
        // 继续处理其他 secrets
      }
    }

    if (Object.keys(allEnvVars).length === 0 && Object.keys(allKeysOnlyVars).length === 0) {
      console.info(yellow('\n⚠️  没有拉取到任何环境变量'));
      return;
    }

    console.info(
      green(`\n✓ 共拉取 ${Object.keys(allEnvVars).length} 个环境变量`)
    );

    // [step 7] 读取现有的 .env 文件
    const {envVars: existingEnvVars} = await loadEnvFile();

    // [step 8] 合并环境变量
    const mergedEnvVars = await mergeEnvVars(existingEnvVars, allEnvVars);

    // [step 8.5] 处理 keysOnly 变量（只在本地不存在时添加）
    const addedKeysOnlyKeys = [];
    const skippedKeysOnlyKeys = [];

    for (const [key, value] of Object.entries(allKeysOnlyVars)) {
      if (!existingEnvVars.hasOwnProperty(key)) {
        // 本地不存在，添加占位符
        mergedEnvVars[key] = value;
        addedKeysOnlyKeys.push(key);
      } else {
        // 本地已存在，保留本地值
        skippedKeysOnlyKeys.push(key);
      }
    }

    if (addedKeysOnlyKeys.length > 0) {
      console.info(
        green(`\n✓ 添加 ${addedKeysOnlyKeys.length} 个 keysOnly 变量（占位符）: ${addedKeysOnlyKeys.join(', ')}`)
      );
    }

    if (skippedKeysOnlyKeys.length > 0) {
      console.info(
        cyan(`\nℹ️  保留本地值的 keysOnly 变量: ${skippedKeysOnlyKeys.join(', ')}`)
      );
    }

    // [step 9] 写入 .env 文件
    const shouldWrite = await confirm({
      message: '是否将环境变量写入 .env 文件?',
      default: true,
    });

    if (shouldWrite) {
      await writeEnvFile(mergedEnvVars);

      // 显示占位符警告（包括普通占位符和 keysOnly 占位符）
      const allPlaceholderKeysToShow = [...new Set([...allPlaceholderKeys, ...addedKeysOnlyKeys])];

      if (allPlaceholderKeysToShow.length > 0) {
        console.info(yellow('\n⚠️  以下环境变量为占位符 <PLEASE_SET_THIS_VALUE>，已写入 .env，需要手动修改:'));
        allPlaceholderKeysToShow.forEach(key => {
          const isKeysOnly = allKeysOnlyKeys.includes(key);
          if (isKeysOnly) {
            console.info(yellow(`   • ${key} ${cyan('(keysOnly 配置)')}`));
          } else {
            console.info(yellow(`   • ${key}`));
          }
        });
        console.info(cyan('\n提示:'));
        console.info(cyan('   1. 直接编辑本地 .env 文件，将占位符替换为实际值'));
        console.info(cyan('   2. 或在 AWS Console 中设置后重新拉取'));
        console.info(cyan(`      aws secretsmanager update-secret --secret-id <secret-name> --secret-string '{...}'\n`));
      }

      console.info(bold(green('🍺 完成!\n')));
    } else {
      console.info(yellow('\n已取消写入\n'));
    }
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
