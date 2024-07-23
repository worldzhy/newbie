const figlet = require('figlet');
const {checkbox, select} = require('@inquirer/prompts');
const {red, green, bold} = require('colorette');
const {
  getAddedMicroservices,
  getRemovedMicroservices,
  getEnabledMicroservices,
  updateEnabledMicroservices,
} = require('./enabled');
const {ALL_MICROSERVICES} = require('./constants');
const {assembleEnvFile} = require('./assemble/env');
const {assembleSourceCodeFiles} = require('./assemble/source-code');
const {assembleSchemaFiles} = require('./assemble/schema');
const {assembleTsConfigFiles} = require('./assemble/tsconfig');

const main = async () => {
  // [step 1] Print the logo of the command-line tool.
  console.info(
    figlet.textSync('Newbie', {
      font: 'Epic',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    })
  );

  // [step 2] Print the usage of the command-line tool.
  console.info('Welcome to use newbie microservices command-line tool:)');
  console.info(
    '----------------------------------------------------------------'
  );
  console.info('* Press <Up> and <Down> to move the cursor.');
  console.info('* Press <Space> to toggle between enabled and disabled.');
  console.info('* Press <Enter> to finish the configuration.');
  console.info('* Press <Q> to quit without saving the configuration.');
  console.info(
    '----------------------------------------------------------------\n'
  );

  // [step 3] Main function.
  const allMicroservices = Object.keys(ALL_MICROSERVICES);
  const currentMicroervices = getEnabledMicroservices();

  // [step 3-1] Enable and disable services.
  const enabledMicroservices = await checkbox({
    message:
      'Which microservices do you want to enable or disable for your project:',
    choices: allMicroservices.map(microservice => {
      const checked = currentMicroervices.includes(microservice);
      return {
        checked,
        value: microservice,
        name: `${microservice}${checked ? '(enabled)' : ''}`,
      };
    }),
    pageSize: 100,
    loop: false,
    theme: {helpMode: 'never'},
  });
  const addedMicroservices = getAddedMicroservices(enabledMicroservices);
  const removedMicroservices = getRemovedMicroservices(enabledMicroservices);

  // [step 3-2] Confirm the operation.
  let message = '';
  if (!addedMicroservices.length && !removedMicroservices.length) {
    console.info(
      '\n[info] You did not make any changes to the microservices.\n'
    );
    process.exit(0);
  } else if (!removedMicroservices.length && addedMicroservices.length) {
    message = `Are you sure you want to enable ${bold(
      green(addedMicroservices.join(', '))
    )} ${addedMicroservices.length > 1 ? 'microservices?' : 'microservice?'}`;
  } else if (removedMicroservices.length && !addedMicroservices.length) {
    message = `Are you sure you want to disable ${bold(
      red(removedMicroservices.join(', '))
    )} ${removedMicroservices.length > 1 ? 'microservices?' : 'microservice?'}`;
  } else {
    message = `Are you sure you want to disable ${bold(
      red(removedMicroservices.join(', '))
    )} ${
      removedMicroservices.length > 1 ? 'microservices' : 'microservice'
    } and enable ${bold(green(addedMicroservices.join(', ')))} ${
      addedMicroservices.length > 1 ? 'microservices?' : 'microservice?'
    }`;
  }

  const result = await select({
    message: `\n${message}`,
    choices: [
      {name: 'Yes', value: 'yes'},
      {name: 'No', value: 'no'},
    ],
    theme: {prefix: '', helpMode: 'never'},
  });

  // [step 3-3] Execute the operation.
  if (result === 'yes') {
    // Update enable.json first.
    updateEnabledMicroservices(enabledMicroservices);

    // Assemable project files.
    assembleSchemaFiles(addedMicroservices, removedMicroservices);
    assembleSourceCodeFiles();
    assembleEnvFile(addedMicroservices, removedMicroservices);
    assembleTsConfigFiles();

    console.log('\n');
  } else {
    console.info(
      '\n[info] You did not make any changes to the microservices.\n'
    );
  }
};

main();

// Close inquirer input if user press "Q" or "Ctrl-C" key
process.stdin.on('keypress', (_, key) => {
  if (key.name === 'q' || (key.ctrl === true && key.name === 'c')) {
    console.info(
      '\n\n[info] You did not make any changes to the microservices.'
    );
    process.exit(0);
  }
});
