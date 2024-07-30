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
  let envObj = {
    toolkit: [],
    framework: [],
  };

  if (fs.existsSync(toolkotConfigPath)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(toolkotConfigPath, {encoding: 'utf8', flag: 'r'})
    );

    envObj.toolkit = Object.keys(env);
  }
  if (fs.existsSync(frameworkConfigPath)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(frameworkConfigPath, {encoding: 'utf8', flag: 'r'})
    );

    envObj.framework = Object.keys(env);
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

      if (!envObj[key]) {
        envObj[key] = [];
      }
      if (fs.existsSync(configFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(configFilePath, {encoding: 'utf8', flag: 'r'})
        );

        envObj[key] = Object.keys(env);
      } else {
        console.error(`[Error] Missing config.json for microservice<${name}>!`);
      }
    }
  });
  return envObj;
};

const checkEnv = () => {
  const missingResult = {};
  const localEnvObj = getLocalEnv();
  const msEnvObj = getMicroservicesEnv();
  const envObj = Object.keys(getEnvObject());

  Object.keys(msEnvObj).forEach(type => {
    msEnvObj[type].forEach(value => {
      if (!envObj.includes(value)) {
        if (!missingResult[type]) {
          missingResult[type] = [];
        }
        missingResult[type].push(value);
      }
    });
  });
  Object.keys(localEnvObj).forEach(type => {
    localEnvObj[type].forEach(value => {
      if (!envObj.includes(value)) {
        if (!missingResult[type]) {
          missingResult[type] = [];
        }
        missingResult[type].push(value);
      }
    });
  });
  const missingType = Object.keys(missingResult);

  if (missingType.length) {
    console.info('Missing environment variables in .env\n');
    missingType.forEach(type => {
      console.info(`Module ${type} missing:\n`);
      console.info(missingResult[type]);
      console.info('\n');
    });
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
