const fs = require('fs');
const {
  ENV_PATH,
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
  FRAMEWORK_CONFIG_JSON,
  TOOLKIT_CONFIG_JSON,
} = require('../newbie.constants');
const {underline} = require('colorette');
const {getObjectFromEnvFile} = require('../.db/env');

const assembleEnvFile = (addedMicroservices, removedMicroservices) => {
  console.info('|' + underline(' 3. updating env...      ') + '|');

  const envObj = getObjectFromEnvFile();

  // [step 1] Assemble framework environment variables
  if (fs.existsSync(FRAMEWORK_CONFIG_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(FRAMEWORK_CONFIG_JSON, {encoding: 'utf8', flag: 'r'})
    );
    Object.keys(env).forEach(key => {
      if (!envObj[key]) {
        envObj[key] = env[key];
      }
    });
  } else {
    console.error(`[Error] Missing framework.config.json!`);
  }

  // [step 2] Assemble toolkit environment variables
  if (fs.existsSync(TOOLKIT_CONFIG_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(TOOLKIT_CONFIG_JSON, {encoding: 'utf8', flag: 'r'})
    );
    Object.keys(env).forEach(key => {
      if (!envObj[key]) {
        envObj[key] = env[key];
      }
    });
  } else {
    console.error(`[Error] Missing toolkit.config.json!`);
  }

  // [step 3] Assemble microservices environment variables
  // [step 3-1] Add variables to the env object.
  addedMicroservices.forEach(name => {
    const {key, configFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }

    if (configFileName) {
      const configFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + key + '.config.json';

      if (fs.existsSync(configFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(configFilePath, {encoding: 'utf8', flag: 'r'})
        );

        Object.keys(env).forEach(key => {
          if (!envObj[key]) {
            envObj[key] = env[key];
          }
        });
      } else {
        console.error(`[Error] Missing config.json for microservice<${name}>!`);
      }
    }
  });

  // [step 3-2] Remove variables from the env object.
  removedMicroservices.forEach(name => {
    const {key, configFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }

    if (configFileName) {
      const configFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + key + '.config.json';

      if (fs.existsSync(configFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(configFilePath, {encoding: 'utf8', flag: 'r'})
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
        console.error(`[Error] Missing config.json for microservice<${name}>!`);
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

module.exports = {
  assembleEnvFile,
};
