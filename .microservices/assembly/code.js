const fs = require('fs');
const {execSync} = require('child_process');
const {underline} = require('colorette');
const {getEnabledMicroservices} = require('../microservices');
const {
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,
} = require('../constants');

const assembleSourceCodeFiles = () => {
  console.info('|' + underline(' 2. updating code...     ') + '|');

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
    const {key, configFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      console.error(`Error: No service <${name}> provided!`);
      return;
    }

    if (configFileName) {
      const configFilePath =
        MICROSERVICES_CODE_PATH + '/' + key + '/' + configFileName;

      if (fs.existsSync(configFilePath)) {
        const {'config-service': config = {}} = JSON.parse(
          fs.readFileSync(configFilePath, {encoding: 'utf8', flag: 'r'})
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

  // [step 3] Format code.
  execSync('npm run format');
};

const EmptyMicroservicesModuleTemplate = () => `
  import {Global, Module} from '@nestjs/common';
  import {ToolkitModule} from '@toolkit/toolkit.module';

  @Global()
  @Module({
    imports: [ToolkitModule],
  })
  export class MicroserviceModule {}
  `;

const EmptyServicesConfigTemplate = () => `
  import {registerAs} from '@nestjs/config';

  export default registerAs('microservice', () => ({}));
  `;

const MicroservicesModuleTemplate = microservices => {
  const selectCode = Object.values(ALL_MICROSERVICES).filter(({key}) =>
    microservices.includes(key)
  );
  const hasService = !!selectCode.length;
  const importCode = `
    import {Global, Module} from '@nestjs/common';
    import {ToolkitModule} from '@toolkit/toolkit.module';
    ${
      hasService
        ? `import MicroserviceConfiguration from './microservice.config';\nimport {ConfigModule} from '@nestjs/config';`
        : ''
    }
    ${selectCode.map(({key}) => ALL_MICROSERVICES[key].importCode).join('\n')}
    `;

  const importModuleNames = `${
    hasService
      ? `ConfigModule.forRoot({load: [MicroserviceConfiguration], isGlobal: true}),`
      : ''
  }${selectCode
    .map(({key}) => ALL_MICROSERVICES[key].moduleNames)
    .join(',\n')}`;

  return `${importCode}
    @Global()
    @Module({
      imports: [
        ToolkitModule,
        ${importModuleNames}
      ],
    })
    export class MicroserviceModule {}
    `;
};

const MicroservicesConfigTemplate = configs => `
  import {registerAs} from '@nestjs/config';

  export default registerAs('microservice', () => (${JSON.stringify(
    configs
  ).replace(/('|")(process.*?)\1/g, '$2')}));
  `;

module.exports = {
  assembleSourceCodeFiles,
};
