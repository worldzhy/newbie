const fs = require('fs');
const {execSync} = require('child_process');
const {getEnabledMicroservices} = require('../enabled');
const {
  ALL_MICROSERVICES,
  MICROSERVICES_PATH,
  MICROSERVICES_MODULE_PATH,
  MICROSERVICES_CONFIG_PATH,
} = require('../constants');

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

const assembleSourceCodeFiles = () => {
  const enabledMicroservices = getEnabledMicroservices();

  // [step 1] Assemble microservice.module.ts
  fs.writeFileSync(
    MICROSERVICES_MODULE_PATH,
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
        MICROSERVICES_PATH + '/' + key + '/' + configFileName;

      if (fs.existsSync(configFilePath)) {
        const {'config-service': config = {}} = JSON.parse(
          fs.readFileSync(configFilePath, {encoding: 'utf8', flag: 'r'})
        );
        configs = {...configs, ...config};
      }
    }
  });
  fs.writeFileSync(
    MICROSERVICES_CONFIG_PATH,
    Object.keys(configs).length
      ? MicroservicesConfigTemplate(configs)
      : EmptyServicesConfigTemplate()
  );

  // [step 3] Format code.
  execSync('npm run format');

  console.info(`Update source code`);
};

module.exports = {
  assembleSourceCodeFiles,
};
