const fs = require('fs');
const {ALL_MICROSERVICES, ENV_PATH} = require('../constants');

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const assembleEnvFile = (addedMicroservices, removedMicroservices) => {
  const envObj = getEnvObject();

  addedMicroservices.forEach(name => {
    const {key, configPath} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`Error: No service <${name}> provided!`);
      return;
    }

    if (configPath) {
      if (fs.existsSync(configPath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(configPath, {encoding: 'utf8', flag: 'r'})
        );

        Object.keys(env).forEach(key => {
          if (!envObj[key]) {
            envObj[key] = env[key];
          }
        });
      } else {
        console.error(`Error: Missing config.json for microservice<${name}>!`);
      }
    }
  });

  removedMicroservices.forEach(name => {
    const {key, configPath} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`Error: No service <${name}> provided!`);
      return;
    }

    if (configPath) {
      if (fs.existsSync(configPath)) {
        const {env = {}} = JSON.parse(
          fs.readFileSync(configPath, {encoding: 'utf8', flag: 'r'})
        );

        const envKeys = Object.keys(env);
        if (envKeys.length) {
          envKeys.forEach(key => {
            if (envObj[key]) {
              delete envObj[key];
            }
          });
        }
      } else {
        console.error(`Error: Missing config.json for microservice<${name}>!`);
      }
    }
  });

  if (Object.keys(envObj).length) {
    fs.writeFileSync(
      ENV_PATH,
      Object.entries(envObj)
        .map(e => e.join('='))
        .join('\n')
    );
    console.info(`Update .env`);
  } else {
    console.error(`Error: .env is empty!`);
  }
};

const getEnvObject = () => {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('Error: Missing .env file!');
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
