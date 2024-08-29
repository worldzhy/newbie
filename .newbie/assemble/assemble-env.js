const fs = require('fs');
const {
  ENABLED_PATH,
  ENV_PATH,
  ALL_MICROSERVICES,
  FRAMEWORK_SETTINGS_JSON,
} = require('../constants/newbie.constants');
const {getObjectFromEnvFile} = require('../utilities/env.util');
const {getEnabledMicroservices} = require('../utilities/microservices.util');

/**
 * The assembleEnvFile function does 2 things:
 * 1. Add or remove variables in .env
 * 2. Generate a copy of .env which is named .env.example (for production deployment)
 */

const assembleEnvFile = (addedMicroservices, removedMicroservices) => {
  const envObj = getObjectFromEnvFile();

  // [step 1] Assemble framework environment variables
  if (fs.existsSync(FRAMEWORK_SETTINGS_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(FRAMEWORK_SETTINGS_JSON, {encoding: 'utf8', flag: 'r'})
    );
    Object.keys(env).forEach(key => {
      if (!envObj[key]) {
        envObj[key] = env[key];
      }
    });
  } else {
    console.error(`[Error] Missing framework.settings.json!`);
  }

  // [step 2] Assemble microservices environment variables
  // [step 2-1] Add variables to the env object.
  addedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }

    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${settingsFileName}`;

      if (fs.existsSync(settingsFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );

        Object.keys(env).forEach(key => {
          if (!envObj[key]) {
            envObj[key] = env[key];
          }
        });
      } else {
        console.error(
          `[Error] Missing settings.json for microservice<${name}>!`
        );
      }
    }
  });

  // [step 2-2] Remove variables from the env object.
  removedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }
    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${settingsFileName}`;

      if (fs.existsSync(settingsFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );

        const envKeys = Object.keys(env);
        if (envKeys.length) {
          envKeys.forEach(key => {
            if (envObj[key] !== undefined) {
              delete envObj[key];
            }
          });
        }
      } else {
        console.error(
          `[Error] Missing settings.json for microservice<${name}>!`
        );
      }
    }
  });

  // [step 3] Write the .env file.
  if (Object.keys(envObj).length > 0) {
    fs.writeFileSync(
      ENV_PATH,
      Object.entries(envObj)
        .map(e => e.join('='))
        .join('\n')
    );
  } else {
    // Do nothing
  }

  // [step 4] Generate .env.example
  generateEnvExampleFile();
};

const generateEnvExampleFile = () => {
  const envExamplePath = './.env.example';
  const enabledMicroservices = getEnabledMicroservices();
  const frameworkHeaderTemplate = `# -------------------------------------------------------------------------------- #
# This file is generated by newbie command-line tool.                              #
# -------------------------------------------------------------------------------- #

# --------------------------------------------------------------------------------
# ! Framework variables are from ${FRAMEWORK_SETTINGS_JSON}
# --------------------------------------------------------------------------------
# ENVIRONMENT: 'production' or 'development'
# SERVER_SERIAL_NUMBER: Related to cronjob
# --------------------------------------------------------------------------------\n`;

  const getHeaderTemplate = (name, path) => `\n
# ----------------------------------------------------------------------------------
# ! ${name} variables are from ${path}
# ----------------------------------------------------------------------------------\n`;
  const capitalizeFirstLetter = string =>
    string.charAt(0).toUpperCase() + string.slice(1);

  // [step 1] Append framework variables to .env.example
  fs.writeFileSync(envExamplePath, frameworkHeaderTemplate);
  if (fs.existsSync(FRAMEWORK_SETTINGS_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(FRAMEWORK_SETTINGS_JSON, {encoding: 'utf8', flag: 'r'})
    );

    if (Object.keys(env).length > 0) {
      fs.appendFileSync(
        envExamplePath,
        Object.entries(env)
          .map(e => e.join('='))
          .join('\n')
      );
    }
  }

  // [step 2] Append microservices variables to .env.example
  enabledMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      return;
    }
    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${settingsFileName}`;

      if (fs.existsSync(settingsFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );

        if (Object.keys(env).length > 0) {
          fs.appendFileSync(
            envExamplePath,
            getHeaderTemplate(capitalizeFirstLetter(key), settingsFilePath)
          );
          fs.appendFileSync(
            envExamplePath,
            Object.entries(env)
              .map(e => e.join('='))
              .join('\n')
          );
        }
      }
    }
  });
};

module.exports = {
  assembleEnvFile,
};
