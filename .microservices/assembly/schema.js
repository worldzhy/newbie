const fs = require('fs');
const {execSync} = require('child_process');
const {underline} = require('colorette');
const {
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
  PRISMA_SCHEMA_PATH,
} = require('../constants');

const assembleSchemaFiles = (addedMicroservices, removedMicroservices) => {
  console.info('|' + underline(' 1. updating schema...   ') + '|');

  // [step 1] Add prisma schema for microservices.
  addedMicroservices.forEach(name => {
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] non-existent microservice<${name}>`);
      return;
    }

    if (schemaFileName) {
      const sourceSchemaPath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + schemaFileName;
      const targetSchemaPath = PRISMA_SCHEMA_PATH + '/' + key + '.prisma';

      if (fs.existsSync(sourceSchemaPath)) {
        const schema = fs.readFileSync(sourceSchemaPath, {
          encoding: 'utf8',
          flag: 'r',
        });

        if (schema) {
          fs.writeFileSync(targetSchemaPath, schema);
        }
      } else {
        console.error(`[Error] Missing schema for microservice<${name}>!`);
      }
    }
  });

  // [step 2] Remove prisma schema for microservices.
  removedMicroservices.forEach(name => {
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] non-existent microservice<${name}>`);
      return;
    }

    if (schemaFileName) {
      const targetSchemaPath = PRISMA_SCHEMA_PATH + '/' + key + '.prisma';

      if (targetSchemaPath && fs.existsSync(targetSchemaPath)) {
        fs.unlinkSync(targetSchemaPath);
      } else {
        // Do nothing.
      }
    }
  });

  // [step 3] Generate prisma client.
  try {
    execSync('npx prisma generate');
  } catch (error) {}
};

module.exports = {
  assembleSchemaFiles,
};
