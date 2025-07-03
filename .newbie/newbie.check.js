const figlet = require('figlet');
const {
  convertEnvFileToObject,
  getEnvsInFrameworkSettingsFile,
  getEnvObjectFromMicroserviceSettingsFiles,
} = require('./utilities/env.util');

const checkEnv = async () => {
  const missingVariables = {};
  const frameworkEnvArray = await getEnvsInFrameworkSettingsFile();
  const microservicesEnvObj = await getEnvObjectFromMicroserviceSettingsFiles();
  const objectEnvObj = await convertEnvFileToObject();
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

const main = async () => {
  // [step 1] Print the logo of the command-line tool.
  console.info(
    figlet.textSync('Newbie', {
      width: 80,
      font: 'Epic',
      verticalLayout: 'default',
      horizontalLayout: 'default',
      whitespaceBreak: true,
    })
  );

  // [step 2] Print the usage of the command-line tool.
  console.info('Welcome to use newbie command-line tool:)');
  console.info(
    '----------------------------------------------------------------'
  );
  console.info('* Checking environment variables...');
  console.info(
    '----------------------------------------------------------------\n'
  );

  // [step 3] Check .env and print missing env variables.
  await checkEnv();
};

main();
