const fs = require('fs/promises');
const {
  CONFIG_PATH,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,
} = require('../constants/path.constants');
const {exec} = require('../utilities/exec.util');
const {exists} = require('../utilities/exists.util');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {getMicroservicesInConfig} = require('../utilities/microservices.util');

const assembleNestJsModules = async () => {
  const enabledMicroservices = await getMicroservicesInConfig();

  // [step 1] Assemble microservice.module.ts
  await fs.writeFile(
    MICROSERVICES_MODULE_TS,
    enabledMicroservices.length
      ? MicroservicesModuleTemplate(enabledMicroservices)
      : EmptyMicroservicesModuleTemplate()
  );

  // [step 2] Assemble microservice.config.ts
  let configs = {};
  for (let i = 0; i < enabledMicroservices.length; i++) {
    const name = enabledMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      continue;
    }
    if (settingsFileName) {
      const settingsFilePath = `${CONFIG_PATH}/${key}/${settingsFileName}`;
      const isExists = await exists(settingsFilePath);

      if (isExists) {
        const file = await fs.readFile(settingsFilePath, {
          encoding: 'utf8',
          flag: 'r',
        });
        const {'config-service': config = {}} = JSON.parse(file);
        configs = {...configs, ...config};
      }
    }
  }
  await fs.writeFile(
    MICROSERVICES_CONFIG_TS,
    Object.keys(configs).length
      ? MicroservicesConfigTemplate(configs)
      : EmptyServicesConfigTemplate()
  );

  // [step 3] Format code.
  try {
    await exec(
      `npx prettier --write ${MICROSERVICES_MODULE_TS} ${MICROSERVICES_CONFIG_TS}`
    );
  } catch (error) {}
};

const EmptyMicroservicesModuleTemplate = () => `
  import {Global, Module} from '@nestjs/common';

  @Global()
  @Module({
    imports: [],
  })
  export class MicroservicesModule {}
  `;

const EmptyServicesConfigTemplate = () => `
  import {registerAs} from '@nestjs/config';

  export default registerAs('microservices', () => ({}));
  `;

const MicroservicesModuleTemplate = microservices => {
  const selectCode = Object.values(ALL_MICROSERVICES).filter(({key}) =>
    microservices.includes(key)
  );
  const hasService = !!selectCode.length;
  const importCode = `
    import {Global, Module} from '@nestjs/common';
    ${
      hasService
        ? `import MicroservicesConfiguration from './microservices.config';\nimport {ConfigModule} from '@nestjs/config';`
        : ''
    }
    ${selectCode.map(({key}) => ALL_MICROSERVICES[key].importCode).join('\n')}
    `;

  const importModuleNames = `${
    hasService
      ? `ConfigModule.forRoot({load: [MicroservicesConfiguration], isGlobal: true}),`
      : ''
  }${selectCode
    .map(({key}) => ALL_MICROSERVICES[key].moduleNames)
    .join(',\n')}`;

  return `${importCode}
    @Global()
    @Module({
      imports: [
        ${importModuleNames}
      ],
    })
    export class MicroservicesModule {}
    `;
};

const MicroservicesConfigTemplate = configs => `
  import {registerAs} from '@nestjs/config';
  import {bool} from '@framework/utilities/bool.util';
  import {int} from '@framework/utilities/int.util';

  export default registerAs('microservices', () => (${JSON.stringify(configs)
    .replace(/('|")(process.*?)\1/g, '$2')
    .replace(/('|")(bool\(process.*?)\1/g, '$2')
    .replace(/('|")(int\(process.*?)\1/g, '$2')}));
  `;

module.exports = {
  assembleNestJsModules,
};
