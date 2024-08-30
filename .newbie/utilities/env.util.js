const fs = require('fs');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {
  ENABLED_PATH,
  ENV_PATH,
  FRAMEWORK_SETTINGS_JSON,
} = require('../constants/path.constants');
const {NEWBIE_DEVELOPER} = require('../constants/env.constants');
const {getEnabledMicroservices} = require('./microservices.util');

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

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
      const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;

      if (!envObj[key]) {
        envObj[key] = [];
      }
      if (fs.existsSync(settingsFilePath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );
        envObj[key] = Object.keys(env);
      } else {
        console.error(`[Error] Missing ${name}.settings.json`);
      }
    }
  });
  return envObj;
};

const isNewbieDeveloper = getObjectFromEnvFile()[NEWBIE_DEVELOPER] === 'true';

module.exports = {
  getObjectFromEnvFile,
  getEnvArrayFromFrameworkConfig,
  getEnvObjectFromMicroservicesConfig,
  isNewbieDeveloper,
};
