const fs = require('fs');
const {
  LINE,
  DB_PATH,
  ENV_PATH,
  ALL_MICROSERVICES,
  FRAMEWORK_SETTINGS_JSON,
} = require('../newbie.constants');
const {getEnabledMicroservices} = require('../.db/microservices');

const getObjectFromEnvFile = () => {
  // [step 1] Copy .env.example to .env if .env is not existed.
  if (!fs.existsSync(ENV_PATH)) {
    fs.writeFileSync(ENV_PATH, '');
  }

  // [step 2] Read .env
  let match;
  const envObj = {};
  const env = fs.readFileSync(ENV_PATH, {encoding: 'utf8', flag: 'r'});
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

const getEnvArrayFromFrameworkConfig = () => {
  if (fs.existsSync(FRAMEWORK_SETTINGS_JSON)) {
    const {env = {}} = JSON.parse(
      fs.readFileSync(FRAMEWORK_SETTINGS_JSON, {encoding: 'utf8', flag: 'r'})
    );
    return Object.keys(env);
  }

  return [];
};

const getEnvObjectFromMicroservicesConfig = () => {
  const envObj = {};
  const enabledMicroservices = getEnabledMicroservices();

  enabledMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (key && settingsFileName) {
      const settingsFilePath = `${DB_PATH}/${settingsFileName}`;

      if (!envObj[key]) {
        envObj[key] = [];
      }
      if (fs.existsSync(settingsFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );
        envObj[key] = Object.keys(env);
      } else {
        console.error(
          `[Error] Missing settings.json for microservice<${name}>!`
        );
      }
    }
  });
  return envObj;
};

module.exports = {
  getObjectFromEnvFile,
  getEnvArrayFromFrameworkConfig,
  getEnvObjectFromMicroservicesConfig,
};
