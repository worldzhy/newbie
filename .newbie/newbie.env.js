const {select} = require('@inquirer/prompts');
const {bold, cyan, green} = require('colorette');
const figlet = require('figlet');
const {spawn} = require('child_process');
const path = require('path');

/**
 * 运行子脚本
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`脚本退出，代码: ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  // [step 1] 打印工具介绍
  console.info(
    cyan(
      figlet.textSync('Newbie Env', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      })
    )
  );

  console.info('Newbie 环境变量管理工具');
  console.info(
    '---------------------------------------------------------------'
  );
  console.info('| AWS Secrets Manager 环境变量双向同步                       |');
  console.info('| • Pull: 从 AWS Secrets Manager 拉取到本地 .env            |');
  console.info('| • Push: 从本地 .env 推送到 AWS Secrets Manager            |');
  console.info(
    '---------------------------------------------------------------\n'
  );

  try {
    // [step 2] 选择操作
    const operation = await select({
      message: '请选择要执行的操作:',
      choices: [
        {
          name: '📥 Pull - 从 AWS Secrets Manager 拉取环境变量到本地',
          value: 'pull',
          description: '从云端拉取最新的环境变量配置',
        },
        {
          name: '📤 Push - 将本地环境变量推送到 AWS Secrets Manager',
          value: 'push',
          description: '将本地配置同步到云端',
        },
      ],
      default: 'pull',
    });

    console.info(green(`\n✓ 已选择操作: ${bold(operation === 'pull' ? 'Pull (拉取)' : 'Push (推送)')}\n`));

    // [step 3] 执行对应的脚本
    const scriptPath =
      operation === 'pull'
        ? path.join(__dirname, 'aws-secrets-pull.js')
        : path.join(__dirname, 'aws-secrets-push.js');

    await runScript(scriptPath);
  } catch (error) {
    if (error.message && error.message.includes('User force closed')) {
      console.info('\n已取消操作\n');
      process.exit(0);
    }
    console.error('\n发生错误:', error.message);
    process.exit(1);
  }
}

main();

// 处理 Ctrl-C
process.on('SIGINT', () => {
  console.info('\n\n已取消操作\n');
  process.exit(0);
});
