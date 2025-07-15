const fs = require('fs/promises');
const {
  ENV_PATH,
  CONFIG_PATH,
  FRAMEWORK_SETTINGS_JSON,
} = require('../constants/path.constants');
const {exists} = require('../utilities/exists.util');
const {NEWBIE_DEVELOPER} = require('../constants/env.constants');
const {getMicroservicesInConfig} = require('./microservices.util');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const convertEnvFileToObject = async () => {
  // [step 1] Copy .env.example to .env if .env is not existed.
  const isExists = await exists(ENV_PATH);
  if (!isExists) {
    await fs.writeFile(ENV_PATH, '');
  }

  // [step 2] Read .env
  let match;
  const envObj = {};
  const env = await fs.readFile(ENV_PATH, {encoding: 'utf8', flag: 'r'});
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

const getEnvsInFrameworkSettingsFile = async () => {
  const isExists = await exists(FRAMEWORK_SETTINGS_JSON);

  if (isExists) {
    const file = await fs.readFile(FRAMEWORK_SETTINGS_JSON, {
      encoding: 'utf8',
      flag: 'r',
    });
    const {env = {}} = JSON.parse(file);
    return Object.keys(env);
  }
  return [];
};

const getEnvObjectFromMicroserviceSettingsFiles = async () => {
  const envObj = {};
  const enabledMicroservices = await getMicroservicesInConfig();

  for (let i = 0; i < enabledMicroservices.length; i++) {
    const name = enabledMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (key && settingsFileName) {
      const settingsFilePath = `${CONFIG_PATH}/${key}/${settingsFileName}`;
      const isExists = await exists(settingsFilePath);

      if (!envObj[key]) {
        envObj[key] = [];
      }
      if (isExists) {
        const file = await fs.readFile(settingsFilePath, {
          encoding: 'utf8',
          flag: 'r',
        });
        const {env = {}} = JSON.parse(file);
        envObj[key] = Object.keys(env);
      } else {
        console.error(`[Error] Missing ${name}.settings.json`);
      }
    }
  }
  return envObj;
};

const isNewbieDeveloper = async () => {
  const envObj = await convertEnvFileToObject();

  return envObj[NEWBIE_DEVELOPER] === 'true';
};

module.exports = {
  isNewbieDeveloper,
  convertEnvFileToObject,
  getEnvsInFrameworkSettingsFile,
  getEnvObjectFromMicroserviceSettingsFiles,
};
