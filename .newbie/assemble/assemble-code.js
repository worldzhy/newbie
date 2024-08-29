const fs = require('fs');
const {
  ENABLED_PATH,
  ALL_MICROSERVICES,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,
} = require('../constants/newbie.constants');
const {execSync} = require('child_process');
const {getEnabledMicroservices} = require('../utilities/microservices.util');

const assembleSourceCodeFiles = removedMicroservices => {
  const enabledMicroservices = getEnabledMicroservices();

  // [step 1] Assemble microservice.module.ts
  fs.writeFileSync(
    MICROSERVICES_MODULE_TS,
    enabledMicroservices.length
      ? MicroservicesModuleTemplate(enabledMicroservices)
      : EmptyMicroservicesModuleTemplate()
  );

  // [step 2] Assemble microservice.config.ts
  let configs = {};
  enabledMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`[Error] Non-existent microservice<${name}>`);
      return;
    }
    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${settingsFileName}`;

      if (fs.existsSync(settingsFilePath)) {
        const {'config-service': config = {}} = JSON.parse(
          fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
        );
        configs = {...configs, ...config};
      }
    }
  });
  fs.writeFileSync(
    MICROSERVICES_CONFIG_TS,
    Object.keys(configs).length
      ? MicroservicesConfigTemplate(configs)
      : EmptyServicesConfigTemplate()
  );

  // [step 3] Remove newbie config files.
  removedMicroservices.forEach(name => {
    const enabledMicroservicesPath = `${ENABLED_PATH}/${name}`;

    if (enabledMicroservicesPath && fs.existsSync(enabledMicroservicesPath)) {
      execSync(`rm -r ${enabledMicroservicesPath}`);
    }
  });

  // [step 4] Format code.
  try {
    execSync('npm run format');
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
  assembleSourceCodeFiles,
};
