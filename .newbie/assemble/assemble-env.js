const fs = require('fs');
const {getObjectFromEnvFile} = require('../.db/env');
const {
  ENV_PATH,
  ALL_MICROSERVICES,
  TOOLKIT_SETTINGS_JSON,
  MICROSERVICES_CODE_PATH,
  FRAMEWORK_SETTINGS_JSON,
} = require('../newbie.constants');

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

  // [step 2] Assemble toolkit environment variables
  if (fs.existsSync(TOOLKIT_SETTINGS_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(TOOLKIT_SETTINGS_JSON, {encoding: 'utf8', flag: 'r'})
    );
    Object.keys(env).forEach(key => {
      if (!envObj[key]) {
        envObj[key] = env[key];
      }
    });
  } else {
    console.error(`[Error] Missing toolkit.settings.json!`);
  }

  // [step 3] Assemble microservices environment variables
  // [step 3-1] Add variables to the env object.
  addedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }

    if (settingsFileName) {
      const settingsFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + key + '.settings.json';

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

  // [step 3-2] Remove variables from the env object.
  removedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }

    if (settingsFileName) {
      const settingsFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + key + '.settings.json';

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

  // [step 4] Write the .env file.
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
};

const updateEnvExampleFile = addedMicroservices => {
  const envExamplePath = './.env.example';
  const frameworkHeaderTemplate = `# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB (Preview) and CockroachDB (Preview).
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings


# ------------------------------------Framework--------------------------------------- #
! Mention ${FRAMEWORK_SETTINGS_JSON} when the following varialbes changes.
# ------------------------------------------------------------------------------------ #
# ENVIRONMENT: 'production' or 'development'                                           #
# SERVER_SERIAL_NUMBER: Related to cronjob                                             #
# DATABASE_URL: @See https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool
# ------------------------------------------------------------------------------------ #\n`;
  const getHeaderTemplate = (
    name,
    path
  ) => `\n\n# ------------------------------------${name}--------------------------------------- #
! Mention ${path} when the following varialbes changes.
# ------------------------------------------------------------------------------------ #\n`;
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

  // [step 2] Append tooltip variables to .env.example
  if (fs.existsSync(TOOLKIT_SETTINGS_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(TOOLKIT_SETTINGS_JSON, {encoding: 'utf8', flag: 'r'})
    );

    if (Object.keys(env).length > 0) {
      fs.appendFileSync(
        envExamplePath,
        getHeaderTemplate('Toolkit', TOOLKIT_SETTINGS_JSON)
      );
      fs.appendFileSync(
        envExamplePath,
        Object.entries(env)
          .map(e => e.join('='))
          .join('\n')
      );
    }
  }

  // [step 3] Append microservices variables to .env.example
  addedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      return;
    }
    if (settingsFileName) {
      const settingsFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + key + '.settings.json';

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
  updateEnvExampleFile,
};
