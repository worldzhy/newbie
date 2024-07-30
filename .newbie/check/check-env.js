const fs = require('fs');
const {
  LINE,
  ENV_PATH,
  ENV_EXAMPLE_PATH,
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
} = require('../constants');
const {getEnabledMicroservices} = require('../.db/microservices');

const toolkotConfigPath = './src/framework/toolkit.config.json';
const frameworkConfigPath = './src/framework/framework.config.json';

const getEnvObject = () => {
  let env, match;
  const envObj = {};

  if (!fs.existsSync(ENV_PATH)) {
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      const envExample = fs.readFileSync(ENV_EXAMPLE_PATH, {
        encoding: 'utf8',
        flag: 'r',
      });

      fs.writeFileSync(ENV_PATH, envExample);
    } else {
      fs.writeFileSync(ENV_PATH, '');
    }
  }
  env = fs.readFileSync(ENV_PATH, {encoding: 'utf8', flag: 'r'});
  const lines = env.toString().replace(/\r\n?/gm, '\n');

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
    envObj[key] = value;
  }
  return envObj;
};
const getLocalEnv = () => {
  let envObj = {};

  if (fs.existsSync(toolkotConfigPath)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(toolkotConfigPath, {encoding: 'utf8', flag: 'r'})
    );

    envObj = {...env};
  }
  if (fs.existsSync(frameworkConfigPath)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(frameworkConfigPath, {encoding: 'utf8', flag: 'r'})
    );

    envObj = {...envObj, ...env};
  }
  return envObj;
};
const getMicroservicesEnv = () => {
  const envObj = {};
  const enabledMicroservices = getEnabledMicroservices();

  enabledMicroservices.forEach(name => {
    const {key, configFileName} = ALL_MICROSERVICES[name] || {};

    if (key && configFileName) {
      const configFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + configFileName;

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
  return envObj;
};

const checkEnv = () => {
  const envObj = Object.keys(getEnvObject());
  const localEnvObj = Object.keys(getLocalEnv());
  const msEnvObj = Object.keys(getMicroservicesEnv());
  const missEnv = [...localEnvObj, ...msEnvObj].filter(
    key => !envObj.includes(key)
  );

  if (missEnv.length) {
    console.info('Missing environment variables in .env: \n', missEnv);
  } else {
    console.info('All environment variables are set!');
  }
  console.info(
    '----------------------------------------------------------------\n'
  );
};

module.exports = {
  checkEnv,
};
