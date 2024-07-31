const fs = require('fs');
const {
  ALL_MICROSERVICES,
  PRISMA_SCHEMA_PATH,
  MICROSERVICES_CODE_PATH,
  PRISMA_SCHEMA_APPLICATION,
} = require('../newbie.constants');
const {underline} = require('colorette');
const {execSync} = require('child_process');
const {getEnabledMicroservices} = require('../.db/microservices');

const assembleApplicationPrisma = () => {
  const enabledMicroservices = getEnabledMicroservices();
  const removedMicroservices = Object.keys(ALL_MICROSERVICES).filter(
    key => !enabledMicroservices.includes(key)
  );
  const enabledPrismaPath = enabledMicroservices.map(
    name => `microservice/${name}`
  );
  const removedPrismaPath = removedMicroservices.map(
    name => `microservice/${name}`
  );
  const prismaFile = fs.readFileSync(PRISMA_SCHEMA_APPLICATION, {
    encoding: 'utf8',
    flag: 'r',
  });
  const updatePrismaFile = prismaFile.replace(
    /(datasource db \{(?:.|\n|\r)*schemas\s*\=\s*)(\[.*?\])/g,
    (...res) => {
      const codeHeader = res[1];
      const schemaStr = res[2];
      const schemaArray = JSON.parse(`{"val": ${schemaStr}}`)?.val;
      const schemaCode = Array.from(
        new Set([
          ...schemaArray.filter(val => !removedPrismaPath.includes(val)),
          ...enabledPrismaPath,
        ])
      );

      return codeHeader + JSON.stringify(schemaCode);
    }
  );

  fs.writeFileSync(PRISMA_SCHEMA_APPLICATION, updatePrismaFile);
};

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

      if (fs.existsSync(sourceSchemaPath)) {
        const schema = fs.readFileSync(sourceSchemaPath, {
          encoding: 'utf8',
          flag: 'r',
        });
        if (schema) {
          if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
            fs.mkdirSync(PRISMA_SCHEMA_PATH);
          }
          fs.writeFileSync(PRISMA_SCHEMA_PATH + '/' + key + '.prisma', schema);
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

  // [step 3] Assemble application.prisma file
  assembleApplicationPrisma();

  // [step 4] Generate prisma client.
  try {
    execSync('npx prisma generate');
  } catch (error) {}
};

module.exports = {
  assembleSchemaFiles,
};
