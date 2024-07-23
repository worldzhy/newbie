const fs = require('fs');
const {execSync} = require('child_process');
const {
  ALL_MICROSERVICES,
  MICROSERVICES_PATH,
  PRISMA_SCHEMA_PATH,
} = require('../constants');

const assembleSchemaFiles = (addedMicroservices, removedMicroservices) => {
  // [step 1] Add prisma schema for microservices.
  addedMicroservices.forEach(name => {
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`Error: No service <${name}> provided!`);
      return;
    }

    if (schemaFileName) {
      const sourceSchemaPath =
        MICROSERVICES_PATH + '/' + key + '/' + schemaFileName;
      const targetSchemaPath = PRISMA_SCHEMA_PATH + '/' + key + '.prisma';

      if (fs.existsSync(sourceSchemaPath)) {
        const schema = fs.readFileSync(sourceSchemaPath, {
          encoding: 'utf8',
          flag: 'r',
        });

        if (schema) {
          fs.writeFileSync(targetSchemaPath, schema);
          console.info(`Add schema for microservice<${name}>`);
        }
      } else {
        console.error(`Error: Missing schema for microservice<${name}>!`);
      }
    }
  });

  // [step 2] Remove prisma schema for microservices.
  removedMicroservices.forEach(name => {
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`Error: No service <${name}> provided!`);
      return;
    }

    if (schemaFileName) {
      const targetSchemaPath = PRISMA_SCHEMA_PATH + '/' + key + '.prisma';

      if (targetSchemaPath && fs.existsSync(targetSchemaPath)) {
        fs.unlinkSync(targetSchemaPath);
        console.info(`Remove schema for microservice<${name}>`);
      } else {
        // Do nothing.
      }
    }
  });

  // [step 3] Generate prisma client.
  execSync('npx prisma generate');
};

module.exports = {
  assembleSchemaFiles,
};
