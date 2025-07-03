const {select} = require('@inquirer/prompts');
const {bold, cyan, green, inverse} = require('colorette');
const figlet = require('figlet');

const {assembleEnvFile} = require('./assemble/assemble-env');
const {assembleSchemaFiles} = require('./assemble/assemble-schema');
const {assembleNestJsAssets} = require('./assemble/assemble-assets');
const {assembleNestJsModules} = require('./assemble/assemble-modules');
const {assembleDependencies} = require('./assemble/assemble-dependencies');
const {
  addRepositories,
  removeRepositories,
} = require('./assemble/assemble-repositories');
const {handleLoading} = require('./utilities/loading.util');
const {
  getMicroservicesToBeInstalledToProject,
  getMicroservicesToBeUninstalledFromProject,
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

  // [step 3] Get microservices to be installed and uninstalled.
  const microservicesToBeInstalled =
    await getMicroservicesToBeInstalledToProject();
  const microservicesToBeUninstalled =
    await getMicroservicesToBeUninstalledFromProject();

  // [step 4] Confirm the operation.
  let message = '';
  if (
    !microservicesToBeInstalled.length &&
    !microservicesToBeUninstalled.length
  ) {
    console.info('\n[info] No microservices need to be installed.\n');
    process.exit(0);
  } else if (
    !microservicesToBeUninstalled.length &&
    microservicesToBeInstalled.length
  ) {
    message = `Do you want to INSTALL ${cyan(
      microservicesToBeInstalled.join(', ')
    )} ?`;
  } else if (
    microservicesToBeUninstalled.length &&
    !microservicesToBeInstalled.length
  ) {
    message = `Do you want to UNINSTALL ${inverse(
      microservicesToBeUninstalled.join(', ')
    )} ?`;
  } else {
    message = `Do you want to UNINSTALL ${inverse(
      microservicesToBeUninstalled.join(', ')
    )} and INSTALL ${cyan(microservicesToBeInstalled.join(', '))} ?`;
  }

  const result = await select({
    message: `${message}`,
    choices: [
      {name: 'Yes', value: 'yes'},
      {name: 'No', value: 'no'},
    ],
    theme: {helpMode: 'auto'},
  });

  // [step 5] Execute the operation.
  if (result === 'yes') {
    // Assemable project files.
    if (microservicesToBeInstalled.length > 0) {
      await handleLoading('🥥 Clone code repositories ', async () => {
        await addRepositories(microservicesToBeInstalled);
      });
    }

    await handleLoading('🍎 Update environment variables', async () => {
      await assembleEnvFile(
        microservicesToBeInstalled,
        microservicesToBeUninstalled
      );
    });

    await handleLoading('🫐 Update database schema', async () => {
      await assembleSchemaFiles(
        microservicesToBeInstalled,
        microservicesToBeUninstalled
      );
    });

    await handleLoading('🍌 Update nestjs assets', async () => {
      await assembleNestJsAssets(
        microservicesToBeInstalled,
        microservicesToBeUninstalled
      );
    });

    await handleLoading('🍉 Update nestjs modules', async () => {
      await assembleNestJsModules();
    });

    await handleLoading('🥝 Update package dependencies', async () => {
      await assembleDependencies(
        microservicesToBeInstalled,
        microservicesToBeUninstalled
      );
    });

    if (microservicesToBeUninstalled.length > 0) {
      await handleLoading('🍒 Delete code repositories', async () => {
        await removeRepositories(microservicesToBeUninstalled);
      });
    }
    console.info(bold(green('🍺 C O M P L E T E\n')));
  } else {
    console.info('\n[info] You did not install any microservices.\n');
  }
};

main();

// Close inquirer input if user press "Q" or "Ctrl-C" key
process.stdin.on('keypress', (_, key) => {
  if (key.name === 'q' || (key.ctrl === true && key.name === 'c')) {
    console.info('\n\n[info] You did not install any microservices.');
    process.exit(0);
  }
});
