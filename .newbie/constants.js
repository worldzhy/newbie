const ENV_PATH = './.env';
const ENV_EXAMPLE_PATH = './.env.example';
const MICROSERVICES_JSON = './.newbie/.db/microservices.json';
const MICROSERVICES_CODE_PATH = './src/microservices';
const MICROSERVICES_MODULE_TS = './src/microservices/microservices.module.ts';
const MICROSERVICES_CONFIG_TS = './src/microservices/microservices.config.ts';
const PRISMA_SCHEMA_PATH = './prisma/schema/microservices';
const TS_CONFIG_BUILD_JSON = './tsconfig.build.json';
const TS_CONFIG_JSON = './tsconfig.json';
const APPLICATION_PRISMA_PATH = './prisma/schema/application.prisma';

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const ALL_MICROSERVICES = {
  account: {
    key: 'account',
    srcPath: './src/microservices/account',
    schemaFileName: 'account.schema',
    configFileName: 'account.config.json',
    moduleNames: 'AccountModule',
    importCode: `import {AccountModule} from './account/account.module';`,
  },
  aws: {
    key: 'aws',
    srcPath: './src/microservices/aws',
    schemaFileName: null,
    configFileName: 'aws.config.json',
    moduleNames: 'AwsModule',
    importCode: `import {AwsModule} from './aws/aws.module';`,
  },
  cloudformation: {
    key: 'cloudformation',
    srcPath: './src/microservices/cloudformation',
    schemaFileName: 'cloudformation.schema',
    configFileName: 'cloudformation.config.json',
    moduleNames: 'AwsCloudformationModule',
    importCode: `import {AwsCloudformationModule} from './cloudformation/cloudformation.module';`,
  },
  'event-scheduling': {
    key: 'event-scheduling',
    srcPath: './src/microservices/event-scheduling',
    schemaFileName: 'event-scheduling.schema',
    configFileName: 'event-scheduling.config.json',
    moduleNames: 'EventSchedulingModule',
    importCode: `import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';`,
  },
  googleapis: {
    key: 'googleapis',
    srcPath: './src/microservices/googleapis',
    schemaFileName: null,
    configFileName: 'googleapis.config.json',
    moduleNames: 'GoogleAPIsModule',
    importCode: `import {GoogleAPIsModule} from './googleapis/googleapis.module';`,
  },
  map: {
    key: 'map',
    srcPath: './src/microservices/map',
    schemaFileName: 'map.schema',
    configFileName: null,
    moduleNames: 'MapModule',
    importCode: `import {MapModule} from './map/map.module';`,
  },
  notification: {
    key: 'notification',
    srcPath: './src/microservices/notification',
    schemaFileName: 'notification.schema',
    configFileName: 'notification.config.json',
    moduleNames: 'NotificationModule',
    importCode: `import {NotificationModule} from './notification/notification.module';`,
  },
  'order-mgmt': {
    key: 'order-mgmt',
    srcPath: './src/microservices/order-mgmt',
    schemaFileName: 'order-mgmt.schema',
    configFileName: null,
    moduleNames: 'OrderManagementModule',
    importCode: `import {OrderManagementModule} from './order-mgmt/order-mgmt.module';`,
  },
  'people-finder': {
    key: 'people-finder',
    srcPath: './src/microservices/people-finder',
    schemaFileName: 'people-finder.schema',
    configFileName: 'people-finder.config.json',
    moduleNames: 'PeopleFinderModule',
    importCode: `import {PeopleFinderModule} from './people-finder/people-finder.module';`,
  },
  queue: {
    key: 'queue',
    srcPath: './src/microservices/queue',
    schemaFileName: 'queue.schema',
    configFileName: null,
    moduleNames: 'QueueModule',
    importCode: `import {QueueModule} from './queue/queue.module';`,
  },
  shortcut: {
    key: 'shortcut',
    srcPath: './src/microservices/shortcut',
    schemaFileName: 'shortcut.schema',
    configFileName: null,
    moduleNames: 'ShortcutModule',
    importCode: `import {ShortcutModule} from './shortcut/shortcut.module';`,
  },
  'stock-mgmt': {
    key: 'stock-mgmt',
    srcPath: './src/microservices/stock-mgmt',
    schemaFileName: 'stock-mgmt.schema',
    configFileName: null,
    moduleNames: 'StockManagementModule',
    importCode: `import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';`,
  },
  storage: {
    key: 'storage',
    srcPath: './src/microservices/storage',
    schemaFileName: 'storage.schema',
    configFileName: 'storage.config.json',
    moduleNames: 'StorageModule',
    importCode: `import {StorageModule} from './storage/storage.module';`,
  },
  tag: {
    key: 'tag',
    srcPath: './src/microservices/tag',
    schemaFileName: 'tag.schema',
    configFileName: null,
    moduleNames: 'TagModule',
    importCode: `import {TagModule} from './tag/tag.module';`,
  },
  'task-scheduling': {
    key: 'task-scheduling',
    srcPath: './src/microservices/task-scheduling',
    schemaFileName: 'task-scheduling.schema',
    configFileName: null,
    moduleNames: 'TaskSchedulingModule',
    importCode: `import {TaskSchedulingModule} from './task-scheduling/task-scheduling.module';`,
  },
  workflow: {
    key: 'workflow',
    srcPath: './src/microservices/workflow',
    schemaFileName: 'workflow.schema',
    configFileName: null,
    moduleNames: 'WorkflowModule',
    importCode: `import {WorkflowModule} from './workflow/workflow.module';`,
  },
};

module.exports = {
  LINE,
  ENV_PATH,
  TS_CONFIG_JSON,
  ENV_EXAMPLE_PATH,
  ALL_MICROSERVICES,
  MICROSERVICES_JSON,
  PRISMA_SCHEMA_PATH,
  TS_CONFIG_BUILD_JSON,
  MICROSERVICES_CODE_PATH,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,
  APPLICATION_PRISMA_PATH,
};
