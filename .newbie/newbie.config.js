const {checkbox, select} = require('@inquirer/prompts');
const {cyan, inverse} = require('colorette');
const figlet = require('figlet');

const {
  ACCOUNT_MICROSERVICE,
  SAAS_MICROSERVICE,
  ALL_MICROSERVICES,
} = require('./constants/microservices.constants');
const {ApplicationMode} = require('./constants/mode.constants');
const {
  getMicroservicesToBeAddedToConfig,
  getMicroservicesToBeRemovedFromConfig,
  getMicroservicesInConfig,
  updateMicroservicesInConfig,
} = require('./utilities/microservices.util');
const {checkDeveloperMode} = require('./utilities/mode.util');

const main = async () => {
  // [step 1] Print the introduction of the command-line tool.
  console.info(
    figlet.textSync('Newbie', {
      font: 'Epic',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    })
  );

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

  // [step 2] Check developer mode.
  if (!(await checkDeveloperMode())) {
    process.exit(0);
  }

  // [step 3] Check application mode.
  // const applicationMode = await checkApplicationMode();
  const applicationMode = ApplicationMode.NON_SAAS_APPLICATION;

  // [step 4] Main function.
  const currentMicroervices = await getMicroservicesInConfig();
  const allMicroservices = Object.keys(ALL_MICROSERVICES);
  if (applicationMode === ApplicationMode.SAAS_APPLICATION) {
    allMicroservices.splice(allMicroservices.indexOf(ACCOUNT_MICROSERVICE), 1);
  } else {
    allMicroservices.splice(allMicroservices.indexOf(SAAS_MICROSERVICE), 1);
  }

  // [step 4-1] Enable and disable services.
  const newEnabledMicroservices = await checkbox({
    message: 'Config microservices:',
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
    theme: {helpMode: 'auto'},
  });
  const addedMicroservices = await getMicroservicesToBeAddedToConfig(
    newEnabledMicroservices
  );
  const removedMicroservices = await getMicroservicesToBeRemovedFromConfig(
    newEnabledMicroservices
  );

  // [step 4-2] Confirm the operation.
  let message = '';
  if (!addedMicroservices.length && !removedMicroservices.length) {
    console.info(
      '\n[info] You did not make any changes to the configuration.\n'
    );
    process.exit(0);
  } else if (!removedMicroservices.length && addedMicroservices.length) {
    message = `Do you want to ADD ${cyan(addedMicroservices.join(', '))} ?`;
  } else if (removedMicroservices.length && !addedMicroservices.length) {
    message = `Do you want to REMOVE ${inverse(
      removedMicroservices.join(', ')
    )} ?`;
  } else {
    message = `Do you want to REMOVE ${inverse(
      removedMicroservices.join(', ')
    )} and ADD ${cyan(addedMicroservices.join(', '))} ?`;
  }

  const result = await select({
    message: `${message}`,
    choices: [
      {name: 'Yes', value: 'yes'},
      {name: 'No', value: 'no'},
    ],
    theme: {helpMode: 'auto'},
  });

  // [step 4-3] Execute the operation.
  if (result === 'yes') {
    // Update enable.json first.
    await updateMicroservicesInConfig(newEnabledMicroservices);
  } else {
    console.info(
      '\n[info] You did not make any changes to the configuration.\n'
    );
  }
};

main();

// Close inquirer input if user press "Q" or "Ctrl-C" key
process.stdin.on('keypress', (_, key) => {
  if (key.name === 'q' || (key.ctrl === true && key.name === 'c')) {
    console.info(
      '\n\n[info] You did not make any changes to the configuration.'
    );
    process.exit(0);
  }
});
