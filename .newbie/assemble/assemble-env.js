const fs = require('fs');
const {
  LINE,
  ENV_PATH,
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
} = require('../constants');
const {underline} = require('colorette');

const assembleEnvFile = (addedMicroservices, removedMicroservices) => {
  console.info('|' + underline(' 3. updating env...      ') + '|');

  const envObj = getEnvObject();

  // [step 1] Add variables to the env object.
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

  // [step 2] Remove variables from the env object.
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
};

const getEnvObject = () => {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('[Error] Missing .env file');
    return {};
  }

  const env = fs.readFileSync(ENV_PATH, {encoding: 'utf8', flag: 'r'});
  const lines = env.toString().replace(/\r\n?/gm, '\n');
  const obj = {};
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || '';

    value = value.trim();
    const maybeQuote = value[0];

    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
    if (maybeQuote === '"') {
      value = value.replace(/\n/g, '\n');
      value = value.replace(/\r/g, '\r');
    }
    obj[key] = value;
  }

  return obj;
};

module.exports = {
  assembleEnvFile,
};
