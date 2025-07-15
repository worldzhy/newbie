const fs = require('fs/promises');
const {
  CONFIG_PATH,
  PRISMA_SCHEMA_MAIN_PATH,
  PRISMA_SCHEMA_MODELS_PATH,
} = require('../constants/path.constants');
const {exec} = require('../utilities/exec.util');
const {exists} = require('../utilities/exists.util');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {getMicroservicesInConfig} = require('../utilities/microservices.util');

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
      const sourceSchemaPath = `${CONFIG_PATH}/${key}/${schemaFileName}`;
      const isExists = await exists(sourceSchemaPath);

      if (isExists) {
        const isExists = await exists(PRISMA_SCHEMA_MODELS_PATH);
        const schema = await fs.readFile(sourceSchemaPath, {
          encoding: 'utf8',
          flag: 'r',
        });

        if (schema) {
          if (!isExists) {
            await fs.mkdir(PRISMA_SCHEMA_MODELS_PATH);
          }
          await fs.writeFile(
            PRISMA_SCHEMA_MODELS_PATH + '/' + key + '.prisma',
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
      const targetSchemaPath =
        PRISMA_SCHEMA_MODELS_PATH + '/' + key + '.prisma';
      const isExists = await exists(targetSchemaPath);

      if (targetSchemaPath && isExists) {
        await fs.unlink(targetSchemaPath);
      } else {
        // Do nothing.
      }
    }
  }

  // [step 3] Assemble main prisma schema.
  await assembleMainPrismaSchema();

  // [step 4] Generate prisma client.
  try {
    await exec('npx prisma generate --allow-no-models');
  } catch (error) {}
};

const assembleMainPrismaSchema = async () => {
  const enabledMicroservices = await getMicroservicesInConfig();
  const removedMicroservices = Object.keys(ALL_MICROSERVICES).filter(
    key => !enabledMicroservices.includes(key)
  );
  const enabledPrismaPath = enabledMicroservices.map(
    name => `microservice/${name}`
  );
  const removedPrismaPath = removedMicroservices.map(
    name => `microservice/${name}`
  );

  const prismaFile = await fs.readFile(PRISMA_SCHEMA_MAIN_PATH, {
    encoding: 'utf8',
    flag: 'r',
  });

  const newPrismaFile = prismaFile.replace(
    /(datasource db \{(?:.|\n|\r)*schemas\s*\=\s*)(\[.*?\])/g,
    (...res) => {
      const firstHalfStr = res[1];
      const secondHalfStr = res[2];

      const currentSchemaArr = JSON.parse(`{"val": ${secondHalfStr}}`)?.val;
      const newSchemaArr = Array.from(
        new Set([
          ...currentSchemaArr.filter(val => !removedPrismaPath.includes(val)),
          ...enabledPrismaPath,
        ])
      );

      return firstHalfStr + JSON.stringify(newSchemaArr).replaceAll(',', ', ');
    }
  );

  await fs.writeFile(PRISMA_SCHEMA_MAIN_PATH, newPrismaFile);
};

module.exports = {
  assembleSchemaFiles,
};
