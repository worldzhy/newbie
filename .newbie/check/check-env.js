const {
  getObjectFromEnvFile,
  getEnvArrayFromFrameworkConfig,
  getEnvObjectFromMicroservicesConfig,
} = require('../utilities/env.util');

const checkEnv = async () => {
  const missingVariables = {};
  const frameworkEnvArray = await getEnvArrayFromFrameworkConfig();
  const microservicesEnvObj = await getEnvObjectFromMicroservicesConfig();
  const objectEnvObj = await getObjectFromEnvFile();
  const envObj = Object.keys(objectEnvObj);

  frameworkEnvArray.forEach(value => {
    if (!envObj.includes(value)) {
      if (!missingVariables['framework']) {
        missingVariables['framework'] = [];
      }
      missingVariables['framework'].push(value);
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
