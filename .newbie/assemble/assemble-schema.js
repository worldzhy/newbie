const fs = require('fs/promises');
const {
  ENABLED_PATH,
  PRISMA_SCHEMA_PATH,
  PRISMA_SCHEMA_APPLICATION,
} = require('../constants/path.constants');
const {exec} = require('../utilities/exec.util');
const {exists} = require('../utilities/exists.util');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {getEnabledMicroservices} = require('../utilities/microservices.util');

const assembleSchemaFiles = async (
  addedMicroservices,
  removedMicroservices
) => {
  // [step 1] Add prisma schema for microservices.
  for (let i = 0; i < addedMicroservices.length; i++) {
    const name = addedMicroservices[i];
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] non-existent microservice<${name}>`);
      continue;
    }
    if (schemaFileName) {
      const sourceSchemaPath = `${ENABLED_PATH}/${key}/${schemaFileName}`;
      const isExists = await exists(sourceSchemaPath);

      if (isExists) {
        const isExists = await exists(PRISMA_SCHEMA_PATH);
        const schema = await fs.readFile(sourceSchemaPath, {
          encoding: 'utf8',
          flag: 'r',
        });

        if (schema) {
          if (!isExists) {
            await fs.mkdir(PRISMA_SCHEMA_PATH);
          }
          await fs.writeFile(
            PRISMA_SCHEMA_PATH + '/' + key + '.prisma',
            schema
          );
        }
      } else {
        console.error(`[Error] Missing ${name}.schema`);
      }
    }
  }

  // [step 2] Remove prisma schema for microservices.
  for (let i = 0; i < removedMicroservices.length; i++) {
    const name = removedMicroservices[i];
    const {key, schemaFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] non-existent microservice<${name}>`);
      continue;
    }

    if (schemaFileName) {
      const targetSchemaPath = PRISMA_SCHEMA_PATH + '/' + key + '.prisma';
      const isExists = await exists(targetSchemaPath);

      if (targetSchemaPath && isExists) {
        await fs.unlink(targetSchemaPath);
      } else {
        // Do nothing.
      }
    }
  }

  // [step 3] Assemble application.prisma file
  await assembleApplicationPrisma();

  // [step 4] Generate prisma client.
  try {
    await exec('npx prisma generate --allow-no-models');
  } catch (error) {}
};

const assembleApplicationPrisma = async () => {
  const enabledMicroservices = await getEnabledMicroservices();
  const removedMicroservices = Object.keys(ALL_MICROSERVICES).filter(
    key => !enabledMicroservices.includes(key)
  );
  const enabledPrismaPath = enabledMicroservices.map(
    name => `microservice/${name}`
  );
  const removedPrismaPath = removedMicroservices.map(
    name => `microservice/${name}`
  );
  const prismaFile = await fs.readFile(PRISMA_SCHEMA_APPLICATION, {
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

  await fs.writeFile(PRISMA_SCHEMA_APPLICATION, updatePrismaFile);
};

module.exports = {
  assembleSchemaFiles,
};
