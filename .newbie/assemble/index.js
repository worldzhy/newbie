const figlet = require('figlet');
const {checkbox, select} = require('@inquirer/prompts');
const {bold, cyan, green, inverse, underline} = require('colorette');
const {
  getAddedMicroservices,
  getRemovedMicroservices,
  getEnabledMicroservices,
  updateEnabledMicroservices,
} = require('../.db/microservices');
const {ALL_MICROSERVICES} = require('../newbie.constants');
const {assembleSourceCodeFiles} = require('./assemble-code');
const {assembleDependencies} = require('./assemble-dependencies');
const {assembleEnvFile} = require('./assemble-env');
const {assembleSchemaFiles} = require('./assemble-schema');
const {cloneSubmodules, removeSubmodules} = require('./assemble-clone');

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
  console.info('What is newbie?');
  console.info(' -----------------------------------------------------------');
  console.info('| Newbie is a backend development framework based on NestJS.|');
  console.info('| The main goal of the framework is to allow developers to  |');
  console.info('| reuse ready-made modules such as account, workflow, etc.  |');
  console.info('| We can flexibly add or remove these ready-made modules in |');
  console.info('| the project.                                              |');
  console.info(
    ' -----------------------------------------------------------\n'
  );

  console.info('How to use newbie?');
  console.info(' -----------------------------------------------------------');
  console.info('|* Press <Up> and <Down> to move the cursor.                |');
  console.info('|* Press <Space> to toggle between enabled and disabled.    |');
  console.info('|* Press <Enter> to finish the configuration.               |');
  console.info('|* Press <Q> to quit without saving the configuration.      |');
  console.info(
    ' -----------------------------------------------------------\n'
  );

  // [step 3] Main function.
  const allMicroservices = Object.keys(ALL_MICROSERVICES);
  const currentMicroervices = getEnabledMicroservices();

  // [step 3-1] Enable and disable services.
  const enabledMicroservices = await checkbox({
    message: 'Which microservices do you want to enable for your project:',
    choices: allMicroservices.map(microservice => {
      const checked = currentMicroervices.includes(microservice);
      return {
        value: microservice,
        name: `${microservice}${checked ? '(enabled)' : ''}`,
        checked,
      };
    }),
    pageSize: 100,
    loop: true,
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
    message = `Are you sure you want to ENABLE ${cyan(
      addedMicroservices.join(', ')
    )} ?`;
  } else if (removedMicroservices.length && !addedMicroservices.length) {
    message = `Are you sure you want to DISABLE ${inverse(
      removedMicroservices.join(', ')
    )} ?`;
  } else {
    message = `Are you sure you want to DISABLE ${inverse(
      removedMicroservices.join(', ')
    )} and ENABLE ${cyan(addedMicroservices.join(', '))} ?`;
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
    console.info(' ' + underline('                             ') + ' ');
    console.info('|' + underline(' 1. clone submodules... ') + '|');
    cloneSubmodules(addedMicroservices);

    console.info('|' + underline(' 2. updating dependencies... ') + '|');
    assembleDependencies(addedMicroservices, removedMicroservices);

    console.info('|' + underline(' 3. updating env...          ') + '|');
    assembleEnvFile(addedMicroservices, removedMicroservices);

    console.info('|' + underline(' 4. updating schema...       ') + '|');
    assembleSchemaFiles(addedMicroservices, removedMicroservices);

    console.info('|' + underline(' 5. updating code...         ') + '|');
    assembleSourceCodeFiles();

    console.info('|' + underline(' 6. remove submodules...     ') + '|');
    removeSubmodules(addedMicroservices, removedMicroservices);

    console.log(bold(green('     C O M P L E T E\n')));
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
