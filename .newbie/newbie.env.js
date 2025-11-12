const {select} = require('@inquirer/prompts');
const {cyan} = require('colorette');
const figlet = require('figlet');
const {spawn} = require('child_process');
const path = require('path');

/**
 * Run a script as a child process
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Script exited with code: ${code}`));
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
 * Main function
 */
async function main() {
  // [step 1] Print tool introduction
  console.info(
    cyan(
      figlet.textSync('Newbie - Env Tool', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 120,
        whitespaceBreak: true,
      })
    )
  );

  console.info('What is Newbie Env Tool?');
  // todo: please simplify below info box
  console.info(' ---------------------------------------------------------------');
  console.info('| Newbie Env Tool is an environment variables management tool   |');
  console.info('| within the Newbie framework project. You can use this tool to |');
  console.info('| synchronize environment variables between your local env file |');
  console.info('| and AWS Secrets Manager.                                      |');
  console.info(' ---------------------------------------------------------------\n');

  try {
    // [step 2] Select operation
    const operation = await select({
      message: 'Select an operation:',
      choices: [
        {
          name: 'Pull',
          value: 'pull',
          description: 'Pull environment variables from AWS Secrets Manager to local .env',
        },
        {
          name: 'Push',
          value: 'push',
          description: 'Push environment variables from local .env to AWS Secrets Manager',
        },
      ],
    });

    // [step 3] Execute corresponding script
    const scriptPath =
      operation === 'pull' ? path.join(__dirname, 'aws-secrets-pull.js') : path.join(__dirname, 'aws-secrets-push.js');

    await runScript(scriptPath);
  } catch (error) {
    if (error.message && error.message.includes('User force closed')) {
      console.info('\nOperation cancelled\n');
      process.exit(0);
    }
    console.error('\nError occurred:', error.message);
    process.exit(1);
  }
}

main();

// Close inquirer input if user press "Q" or "Ctrl-C" key
process.stdin.on('keypress', (_, key) => {
  if (key.name === 'q' || (key.ctrl === true && key.name === 'c')) {
    console.info('\n\nOperation cancelled\n');
    process.exit(0);
  }
});
