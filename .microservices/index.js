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
  console.info(
    `\n----------------------------------------------------------------\n* Press <Up> and <Down> to move the cursor.\n* Press <Space> to toggle between enabled and disabled.\n* Press <Enter> to finish the configuration.\n* Press <Q> to quit without saving the configuration.\n----------------------------------------------------------------\n`
  );

  // [step 3] Main function.
  const allMicroservices = Object.keys(ALL_MICROSERVICES);
  const currentMicroervices = getEnabledMicroservices();

  // [step 3-1] Enable and disable services.
  const enabledMicroservices = await checkbox({
    message: 'Enable or disable services in the project:',
    choices: allMicroservices.map(microservice => {
      const checked = currentMicroervices.includes(microservice);
      return {
        checked,
        value: microservice,
        name: `${microservice}${checked ? ' (Enabled)' : ''}`,
      };
    }),
    loop: false,
    pageSize: 20,
    theme: {
      prefix: '',
      helpMode: 'never',
    },
  });
  const addedMicroservices = getAddedMicroservices(enabledMicroservices);
  const removedMicroservices = getRemovedMicroservices(enabledMicroservices);

  // [step 3-2] Confirm the operation.
  let message = '';
  if (!addedMicroservices.length && !removedMicroservices.length) {
    console.info('\nNo changes');
    process.exit(1);
  } else if (!removedMicroservices.length && addedMicroservices.length) {
    message = `Are you sure to enable ${bold(
      green(addedMicroservices.join(', '))
    )} ${addedMicroservices.length > 1 ? 'services?' : 'service?'}`;
  } else if (removedMicroservices.length && !addedMicroservices.length) {
    message = `Are you sure to disable ${bold(
      red(removedMicroservices.join(', '))
    )} ${removedMicroservices.length > 1 ? 'services?' : 'service?'}`;
  } else {
    message = `Are you sure to disable ${bold(
      red(removedMicroservices.join(', '))
    )} ${
      removedMicroservices.length > 1 ? 'services' : 'service'
    } and enable ${bold(green(addedMicroservices.join(', ')))} ${
      addedMicroservices.length > 1 ? 'services?' : 'service?'
    }`;
  }

  const result = await select({
    message: `\n${message}`,
    choices: [
      {name: 'Yes', value: 'yes'},
      {name: 'No', value: 'no'},
    ],
    theme: {
      prefix: '',
      helpMode: 'always',
    },
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
    console.log('Operation canceled.\n');
  }
};

main();
