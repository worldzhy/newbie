const {select} = require('@inquirer/prompts');
const fs = require('fs/promises');
const {CONFIG_JSON} = require('../constants/path.constants');
const {NEWBIE_DEVELOPER} = require('../constants/env.constants');
const {ApplicationMode, DeveloperMode} = require('../constants/mode.constants');
const {isNewbieDeveloper} = require('../utilities/env.util');
const {exists} = require('../utilities/exists.util');
const {getMicroservicesInConfig} = require('../utilities/microservices.util');

const getApplicationMode = async () => {
  const isExists = await exists(CONFIG_JSON);
  if (!isExists) {
    return null;
  }

  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const obj = JSON.parse(file);

  return obj.applicationMode;
};

const setApplicationMode = async mode => {
  const isExists = await exists(CONFIG_JSON);
  if (!isExists) {
    return await fs.writeFile(
      CONFIG_JSON,
      JSON.stringify({applicationMode: mode}, null, 2)
    );
  }

  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const obj = JSON.parse(file);
  obj.applicationMode = mode;

  return await fs.writeFile(CONFIG_JSON, JSON.stringify(obj, null, 2));
};

const checkApplicationMode = async () => {
  let applicationMode = await getApplicationMode();

  if (!Object.values(ApplicationMode).includes(applicationMode)) {
    applicationMode = await select({
      message: 'Which application mode do you want to enable for your project:',
      choices: [
        {
          name: 'Non-SaaS Application',
          value: ApplicationMode.NON_SAAS_APPLICATION,
        },
        {name: 'SaaS Application', value: ApplicationMode.SAAS_APPLICATION},
      ],
      theme: {helpMode: 'auto'},
    });
    await setApplicationMode(applicationMode);
  }

  return applicationMode;
};

const getDeveloperMode = async () => {
  const isExists = await exists(CONFIG_JSON);
  if (!isExists) {
    return null;
  }

  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const obj = JSON.parse(file);

  return obj.developerMode;
};

const setDeveloperMode = async mode => {
  const isExists = await exists(CONFIG_JSON);
  if (!isExists) {
    return await fs.writeFile(
      CONFIG_JSON,
      JSON.stringify({developerMode: mode}, null, 2)
    );
  }

  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const obj = JSON.parse(file);
  obj.developerMode = mode;

  return await fs.writeFile(CONFIG_JSON, JSON.stringify(obj, null, 2));
};

const checkDeveloperMode = async () => {
  const developerMode = await getDeveloperMode();
  const isNewbieDeveloperNow = await isNewbieDeveloper();

  if (!Object.values(DeveloperMode).includes(developerMode)) {
    // Sync developer mode from env
    await setDeveloperMode(
      isNewbieDeveloperNow
        ? DeveloperMode.NEWBIE_DEVELOPER
        : DeveloperMode.APPLICATION_DEVELOPER
    );
  }

  const isNewbieDeveloperBefore =
    developerMode === DeveloperMode.NEWBIE_DEVELOPER;

  const enabledMicroservices = await getMicroservicesInConfig();

  if (isNewbieDeveloperBefore === isNewbieDeveloperNow) {
    return true;
  } else if (enabledMicroservices.length === 0) {
    await setDeveloperMode(
      isNewbieDeveloperNow
        ? DeveloperMode.NEWBIE_DEVELOPER
        : DeveloperMode.APPLICATION_DEVELOPER
    );
    return true;
  } else {
    console.warn(
      `You are trying to change the developer mode ${isNewbieDeveloperBefore ? 'newbie developer -> application developer' : 'application developer -> newbie developer'}.
      
      Please follow the steps below:

      1. Set ${NEWBIE_DEVELOPER} = ${isNewbieDeveloperBefore} in .env file.
      2. Run 'npm run newbie' in your Terminal.
      3. Disable all the microservices.
      4. Set ${NEWBIE_DEVELOPER} = ${isNewbieDeveloperNow} in .env file.
      
      Then the mode will be changed.\n`
    );

    return false;
  }
};

module.exports = {
  getApplicationMode,
  setApplicationMode,
  checkApplicationMode,
  getDeveloperMode,
  setDeveloperMode,
  checkDeveloperMode,
};
