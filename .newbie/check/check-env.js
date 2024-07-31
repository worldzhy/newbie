const fs = require('fs');
const {
  getObjectFromEnvFile,
  getEnvArrayFromFrameworkConfig,
  getEnvArrayFromToolkitConfig,
  getEnvObjectFromMicroservicesConfig,
} = require('../.db/env');

const checkEnv = () => {
  const missingVariables = {};
  const frameworkEnvArray = getEnvArrayFromFrameworkConfig();
  const toolkitEnvArray = getEnvArrayFromToolkitConfig();
  const microservicesEnvObj = getEnvObjectFromMicroservicesConfig();
  const envObj = Object.keys(getObjectFromEnvFile());

  frameworkEnvArray.forEach(value => {
    if (!envObj.includes(value)) {
      if (!missingVariables['framework']) {
        missingVariables['framework'] = [];
      }
      missingVariables['framework'].push(value);
    }
  });

  toolkitEnvArray.forEach(value => {
    if (!envObj.includes(value)) {
      if (!missingVariables['toolkit']) {
        missingVariables['toolkit'] = [];
      }
      missingVariables['toolkit'].push(value);
    }
  });

  Object.keys(microservicesEnvObj).forEach(moduleName => {
    microservicesEnvObj[moduleName].forEach(value => {
      if (!envObj.includes(value)) {
        if (!missingVariables[moduleName]) {
          missingVariables[moduleName] = [];
        }
        missingVariables[moduleName].push(value);
      }
    });
  });

  const missingType = Object.keys(missingVariables);

  if (missingType.length) {
    missingType.forEach(type => {
      console.info(`Module ${type} missing:`);
      console.info(missingVariables[type]);
      console.info('\n');
    });
  } else {
    console.info('[info] All environment variables are set.');
  }
};

module.exports = {
  checkEnv,
};
