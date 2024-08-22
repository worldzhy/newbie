const DB_ENV = './.newbie/.db/env.json';
const DB_MICROSERVICES = './.newbie/.db/microservices.json';

const ENV_PATH = './.env';

const MICROSERVICES_CODE_PATH = './src/microservices';
const MICROSERVICES_MODULE_TS = './src/microservices/microservices.module.ts';
const MICROSERVICES_CONFIG_TS = './src/microservices/microservices.config.ts';

const FRAMEWORK_SETTINGS_JSON = './src/framework/framework.settings.json';

const PRISMA_SCHEMA_PATH = './prisma/schema/microservices';
const PRISMA_SCHEMA_APPLICATION = './prisma/schema/application.prisma';

const TS_CONFIG_BUILD_JSON = './tsconfig.build.json';
const TS_CONFIG_JSON = './tsconfig.json';

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const ALL_MICROSERVICES = {
  account: {
    key: 'account',
    srcPath: './src/microservices/account',
    schemaFileName: 'account.schema',
    settingsFileName: 'account.settings.json',
    moduleNames: 'AccountModule',
    importCode: `import {AccountModule} from './account/account.module';`,
  },
  'aws-s3': {
    key: 'aws-s3',
    srcPath: './src/microservices/aws-s3',
    schemaFileName: 'aws-s3.schema',
    settingsFileName: 'aws-s3.settings.json',
    moduleNames: 'AwsS3Module',
    importCode: `import {AwsS3Module} from './aws-s3/aws-s3.module';`,
  },
  'aws-sqs': {
    key: 'aws-sqs',
    srcPath: './src/microservices/aws-sqs',
    schemaFileName: null,
    settingsFileName: 'aws-sqs.settings.json',
    moduleNames: 'AwsSqsModule',
    importCode: `import {AwsSqsModule} from './aws-sqs/aws-sqs.module';`,
  },
  cache: {
    key: 'cache',
    srcPath: './src/microservices/cache',
    schemaFileName: null,
    settingsFileName: 'cache.settings.json',
    moduleNames: 'NewbieCacheModule',
    importCode: `import {NewbieCacheModule} from './cache/cache.module';`,
  },
  cloudformation: {
    key: 'cloudformation',
    srcPath: './src/microservices/cloudformation',
    schemaFileName: 'cloudformation.schema',
    settingsFileName: 'cloudformation.settings.json',
    moduleNames: 'AwsCloudformationModule',
    importCode: `import {AwsCloudformationModule} from './cloudformation/cloudformation.module';`,
  },
  elasticsearch: {
    key: 'elasticsearch',
    srcPath: './src/microservices/elasticsearch',
    schemaFileName: null,
    settingsFileName: 'elasticsearch.settings.json',
    moduleNames: 'ElasticsearchModule',
    importCode: `import {ElasticsearchModule} from './elasticsearch/elasticsearch.module';`,
  },
  'event-scheduling': {
    key: 'event-scheduling',
    srcPath: './src/microservices/event-scheduling',
    schemaFileName: 'event-scheduling.schema',
    settingsFileName: 'event-scheduling.settings.json',
    moduleNames: 'EventSchedulingModule',
    importCode: `import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';`,
  },
  googleapis: {
    key: 'googleapis',
    srcPath: './src/microservices/googleapis',
    schemaFileName: null,
    settingsFileName: 'googleapis.settings.json',
    moduleNames: 'GoogleAPIsModule',
    importCode: `import {GoogleAPIsModule} from './googleapis/googleapis.module';`,
  },
  map: {
    key: 'map',
    srcPath: './src/microservices/map',
    schemaFileName: 'map.schema',
    settingsFileName: null,
    moduleNames: 'MapModule',
    importCode: `import {MapModule} from './map/map.module';`,
  },
  notification: {
    key: 'notification',
    srcPath: './src/microservices/notification',
    schemaFileName: 'notification.schema',
    settingsFileName: 'notification.settings.json',
    moduleNames: 'NotificationModule',
    importCode: `import {NotificationModule} from './notification/notification.module';`,
  },
  'order-mgmt': {
    key: 'order-mgmt',
    srcPath: './src/microservices/order-mgmt',
    schemaFileName: 'order-mgmt.schema',
    settingsFileName: 'order-mgmt.settings.json',
    moduleNames: 'OrderManagementModule',
    importCode: `import {OrderManagementModule} from './order-mgmt/order-mgmt.module';`,
  },
  pdf: {
    key: 'pdf',
    srcPath: './src/microservices/pdf',
    schemaFileName: null,
    settingsFileName: 'pdf.settings.json',
    moduleNames: 'PdfModule',
    importCode: `import {PdfModule} from './pdf/pdf.module';`,
  },
  'people-finder': {
    key: 'people-finder',
    srcPath: './src/microservices/people-finder',
    schemaFileName: 'people-finder.schema',
    settingsFileName: 'people-finder.settings.json',
    moduleNames: 'PeopleFinderModule',
    importCode: `import {PeopleFinderModule} from './people-finder/people-finder.module';`,
  },
  queue: {
    key: 'queue',
    srcPath: './src/microservices/queue',
    schemaFileName: 'queue.schema',
    settingsFileName: 'queue.settings.json',
    moduleNames: 'NewbieQueueModule',
    importCode: `import {NewbieQueueModule} from './queue/queue.module';`,
  },
  'saas-starter': {
    key: 'saas-starter',
    srcPath: './src/microservices/saas-starter',
    schemaFileName: 'saas-starter.schema',
    settingsFileName: 'saas-starter.settings.json',
    moduleNames: 'SaasStarterModule',
    importCode: `import {SaasStarterModule} from './saas-starter/saas-starter.module';`,
  },
  shortcut: {
    key: 'shortcut',
    srcPath: './src/microservices/shortcut',
    schemaFileName: 'shortcut.schema',
    settingsFileName: null,
    moduleNames: 'ShortcutModule',
    importCode: `import {ShortcutModule} from './shortcut/shortcut.module';`,
  },
  snowflake: {
    key: 'snowflake',
    srcPath: './src/microservices/snowflake',
    schemaFileName: null,
    settingsFileName: 'snowflake.settings.json',
    moduleNames: 'SnowflakeModule',
    importCode: `import {SnowflakeModule} from './snowflake/snowflake.module';`,
  },
  'stock-mgmt': {
    key: 'stock-mgmt',
    srcPath: './src/microservices/stock-mgmt',
    schemaFileName: 'stock-mgmt.schema',
    settingsFileName: null,
    moduleNames: 'StockManagementModule',
    importCode: `import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';`,
  },
  storage: {
    key: 'storage',
    srcPath: './src/microservices/storage',
    schemaFileName: 'storage.schema',
    settingsFileName: 'storage.settings.json',
    moduleNames: 'StorageModule',
    importCode: `import {StorageModule} from './storage/storage.module';`,
  },
  tag: {
    key: 'tag',
    srcPath: './src/microservices/tag',
    schemaFileName: 'tag.schema',
    settingsFileName: null,
    moduleNames: 'TagModule',
    importCode: `import {TagModule} from './tag/tag.module';`,
  },
  'task-scheduling': {
    key: 'task-scheduling',
    srcPath: './src/microservices/task-scheduling',
    schemaFileName: 'task-scheduling.schema',
    settingsFileName: 'task-scheduling.settings.json',
    moduleNames: 'TaskSchedulingModule',
    importCode: `import {TaskSchedulingModule} from './task-scheduling/task-scheduling.module';`,
  },
  workflow: {
    key: 'workflow',
    srcPath: './src/microservices/workflow',
    schemaFileName: 'workflow.schema',
    settingsFileName: null,
    moduleNames: 'WorkflowModule',
    importCode: `import {WorkflowModule} from './workflow/workflow.module';`,
  },
  xlsx: {
    key: 'xlsx',
    srcPath: './src/microservices/xlsx',
    schemaFileName: null,
    settingsFileName: 'xlsx.settings.json',
    moduleNames: 'XLSXModule',
    importCode: `import {XLSXModule} from './xlsx/xlsx.module';`,
  },
};

module.exports = {
  DB_MICROSERVICES,

  ENV_PATH,

  MICROSERVICES_CODE_PATH,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,

  FRAMEWORK_SETTINGS_JSON,

  PRISMA_SCHEMA_PATH,
  PRISMA_SCHEMA_APPLICATION,

  TS_CONFIG_JSON,
  TS_CONFIG_BUILD_JSON,

  LINE,
  ALL_MICROSERVICES,
};
