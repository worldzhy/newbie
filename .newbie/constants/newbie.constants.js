const ENABLED_PATH = './.newbie/.enabled';
const ENABLED_MICROSERVICES = './.newbie/.enabled/microservices.json';

const FRAMEWORK_SETTINGS_JSON = './src/framework/framework.settings.json';
const MICROSERVICES_MODULE_TS = './src/microservices/microservices.module.ts';
const MICROSERVICES_CONFIG_TS = './src/microservices/microservices.config.ts';

const PRISMA_SCHEMA_PATH = './prisma/schema/microservices';
const PRISMA_SCHEMA_APPLICATION = './prisma/schema/application.prisma';

const ENV_PATH = './.env';
const GIT_MODULES = './.gitmodules';

const NEWBIE_DEVELOPER = 'NEWBIE_DEVELOPER';

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\'|[^'])*'|\s*"(?:\"|[^"])*"|\s*`(?:\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

const ALL_MICROSERVICES = {
  account: {
    key: 'account',
    srcPath: 'src/microservices/account',
    repositoryUrl: 'https://github.com/worldzhy/newbie.account.git',
    schemaFileName: 'account.schema',
    settingsFileName: 'account.settings.json',
    moduleNames: 'AccountModule',
    importCode: `import {AccountModule} from './account/account.module';`,
  },
  'aws-s3': {
    key: 'aws-s3',
    srcPath: 'src/microservices/aws-s3',
    repositoryUrl: 'https://github.com/worldzhy/newbie.aws-s3.git',
    schemaFileName: 'aws-s3.schema',
    settingsFileName: 'aws-s3.settings.json',
    moduleNames: 'AwsS3Module',
    importCode: `import {AwsS3Module} from './aws-s3/aws-s3.module';`,
  },
  'aws-sqs': {
    key: 'aws-sqs',
    srcPath: 'src/microservices/aws-sqs',
    repositoryUrl: 'https://github.com/worldzhy/newbie.aws-sqs.git',
    schemaFileName: null,
    settingsFileName: 'aws-sqs.settings.json',
    moduleNames: 'AwsSqsModule',
    importCode: `import {AwsSqsModule} from './aws-sqs/aws-sqs.module';`,
  },
  cache: {
    key: 'cache',
    srcPath: 'src/microservices/cache',
    repositoryUrl: 'https://github.com/worldzhy/newbie.cache.git',
    schemaFileName: null,
    settingsFileName: 'cache.settings.json',
    moduleNames: 'NewbieCacheModule',
    importCode: `import {NewbieCacheModule} from './cache/cache.module';`,
  },
  cloudformation: {
    key: 'cloudformation',
    srcPath: 'src/microservices/cloudformation',
    repositoryUrl: 'https://github.com/worldzhy/newbie.cloudformation.git',
    schemaFileName: 'cloudformation.schema',
    settingsFileName: 'cloudformation.settings.json',
    moduleNames: 'AwsCloudformationModule',
    importCode: `import {AwsCloudformationModule} from './cloudformation/cloudformation.module';`,
  },
  cloudinary: {
    key: 'cloudinary',
    srcPath: 'src/microservices/cloudinary',
    repositoryUrl: 'https://github.com/worldzhy/newbie.cloudinary.git',
    schemaFileName: null,
    settingsFileName: 'cloudinary.settings.json',
    moduleNames: 'CloudinaryModule',
    importCode: `import {CloudinaryModule} from './cloudinary/cloudinary.module';`,
  },
  elasticsearch: {
    key: 'elasticsearch',
    srcPath: 'src/microservices/elasticsearch',
    repositoryUrl: 'https://github.com/worldzhy/newbie.elasticsearch.git',
    schemaFileName: null,
    settingsFileName: 'elasticsearch.settings.json',
    moduleNames: 'ElasticsearchModule',
    importCode: `import {ElasticsearchModule} from './elasticsearch/elasticsearch.module';`,
  },
  'event-scheduling': {
    key: 'event-scheduling',
    srcPath: 'src/microservices/event-scheduling',
    repositoryUrl: 'https://github.com/worldzhy/newbie.event-scheduling.git',
    schemaFileName: 'event-scheduling.schema',
    settingsFileName: 'event-scheduling.settings.json',
    moduleNames: 'EventSchedulingModule',
    importCode: `import {EventSchedulingModule} from './event-scheduling/event-scheduling.module';`,
  },
  github: {
    key: 'github',
    srcPath: 'src/microservices/github',
    repositoryUrl: 'https://github.com/worldzhy/newbie.github.git',
    schemaFileName: null,
    settingsFileName: 'github.settings.json',
    moduleNames: 'GitHubModule',
    importCode: `import {GitHubModule} from './github/github.module';`,
  },
  googleapis: {
    key: 'googleapis',
    srcPath: 'src/microservices/googleapis',
    repositoryUrl: 'https://github.com/worldzhy/newbie.googleapis.git',
    schemaFileName: null,
    settingsFileName: 'googleapis.settings.json',
    moduleNames: 'GoogleAPIsModule',
    importCode: `import {GoogleAPIsModule} from './googleapis/googleapis.module';`,
  },
  map: {
    key: 'map',
    srcPath: 'src/microservices/map',
    repositoryUrl: 'https://github.com/worldzhy/newbie.map.git',
    schemaFileName: 'map.schema',
    settingsFileName: null,
    moduleNames: 'MapModule',
    importCode: `import {MapModule} from './map/map.module';`,
  },
  notification: {
    key: 'notification',
    srcPath: 'src/microservices/notification',
    repositoryUrl: 'https://github.com/worldzhy/newbie.notification.git',
    schemaFileName: 'notification.schema',
    settingsFileName: 'notification.settings.json',
    moduleNames: 'NotificationModule',
    importCode: `import {NotificationModule} from './notification/notification.module';`,
  },
  'order-mgmt': {
    key: 'order-mgmt',
    srcPath: 'src/microservices/order-mgmt',
    repositoryUrl: 'https://github.com/worldzhy/newbie.order-mgmt.git',
    schemaFileName: 'order-mgmt.schema',
    settingsFileName: 'order-mgmt.settings.json',
    moduleNames: 'OrderManagementModule',
    importCode: `import {OrderManagementModule} from './order-mgmt/order-mgmt.module';`,
  },
  pdf: {
    key: 'pdf',
    srcPath: 'src/microservices/pdf',
    repositoryUrl: 'https://github.com/worldzhy/newbie.pdf.git',
    schemaFileName: null,
    settingsFileName: 'pdf.settings.json',
    moduleNames: 'PdfModule',
    importCode: `import {PdfModule} from './pdf/pdf.module';`,
  },
  'people-finder': {
    key: 'people-finder',
    srcPath: 'src/microservices/people-finder',
    repositoryUrl: 'https://github.com/worldzhy/newbie.people-finder.git',
    schemaFileName: 'people-finder.schema',
    settingsFileName: 'people-finder.settings.json',
    moduleNames: 'PeopleFinderModule',
    importCode: `import {PeopleFinderModule} from './people-finder/people-finder.module';`,
  },
  puppeteer: {
    key: 'puppeteer',
    srcPath: 'src/microservices/puppeteer',
    repositoryUrl: 'https://github.com/worldzhy/newbie.puppeteer.git',
    schemaFileName: null,
    settingsFileName: 'puppeteer.settings.json',
    moduleNames: 'PuppeteerModule',
    importCode: `import {PuppeteerModule} from './puppeteer/puppeteer.module';`,
  },
  queue: {
    key: 'queue',
    srcPath: 'src/microservices/queue',
    repositoryUrl: 'https://github.com/worldzhy/newbie.queue.git',
    schemaFileName: 'queue.schema',
    settingsFileName: 'queue.settings.json',
    moduleNames: 'NewbieQueueModule',
    importCode: `import {NewbieQueueModule} from './queue/queue.module';`,
  },
  shortcut: {
    key: 'shortcut',
    srcPath: 'src/microservices/shortcut',
    repositoryUrl: 'https://github.com/worldzhy/newbie.shortcut.git',
    schemaFileName: 'shortcut.schema',
    settingsFileName: null,
    moduleNames: 'ShortcutModule',
    importCode: `import {ShortcutModule} from './shortcut/shortcut.module';`,
  },
  slack: {
    key: 'slack',
    srcPath: 'src/microservices/slack',
    repositoryUrl: 'https://github.com/worldzhy/newbie.slack.git',
    schemaFileName: null,
    settingsFileName: 'slack.settings.json',
    moduleNames: 'SlackModule',
    importCode: `import {SlackModule} from './slack/slack.module';`,
  },
  snowflake: {
    key: 'snowflake',
    srcPath: 'src/microservices/snowflake',
    repositoryUrl: 'https://github.com/worldzhy/newbie.snowflake.git',
    schemaFileName: null,
    settingsFileName: 'snowflake.settings.json',
    moduleNames: 'SnowflakeModule',
    importCode: `import {SnowflakeModule} from './snowflake/snowflake.module';`,
  },
  'stock-mgmt': {
    key: 'stock-mgmt',
    srcPath: 'src/microservices/stock-mgmt',
    repositoryUrl: 'https://github.com/worldzhy/newbie.stock-mgmt.git',
    schemaFileName: 'stock-mgmt.schema',
    settingsFileName: null,
    moduleNames: 'StockManagementModule',
    importCode: `import {StockManagementModule} from './stock-mgmt/stock-mgmt.module';`,
  },
  storage: {
    key: 'storage',
    srcPath: 'src/microservices/storage',
    repositoryUrl: 'https://github.com/worldzhy/newbie.storage.git',
    schemaFileName: 'storage.schema',
    settingsFileName: 'storage.settings.json',
    moduleNames: 'StorageModule',
    importCode: `import {StorageModule} from './storage/storage.module';`,
  },
  tag: {
    key: 'tag',
    srcPath: 'src/microservices/tag',
    repositoryUrl: 'https://github.com/worldzhy/newbie.tag.git',
    schemaFileName: 'tag.schema',
    settingsFileName: null,
    moduleNames: 'TagModule',
    importCode: `import {TagModule} from './tag/tag.module';`,
  },
  'task-scheduling': {
    key: 'task-scheduling',
    srcPath: 'src/microservices/task-scheduling',
    repositoryUrl: 'https://github.com/worldzhy/newbie.task-scheduling.git',
    schemaFileName: 'task-scheduling.schema',
    settingsFileName: 'task-scheduling.settings.json',
    moduleNames: 'TaskSchedulingModule',
    importCode: `import {TaskSchedulingModule} from './task-scheduling/task-scheduling.module';`,
  },
  workflow: {
    key: 'workflow',
    srcPath: 'src/microservices/workflow',
    repositoryUrl: 'https://github.com/worldzhy/newbie.workflow.git',
    schemaFileName: 'workflow.schema',
    settingsFileName: null,
    moduleNames: 'WorkflowModule',
    importCode: `import {WorkflowModule} from './workflow/workflow.module';`,
  },
  xlsx: {
    key: 'xlsx',
    srcPath: 'src/microservices/xlsx',
    repositoryUrl: 'https://github.com/worldzhy/newbie.xlsx.git',
    schemaFileName: null,
    settingsFileName: 'xlsx.settings.json',
    moduleNames: 'XLSXModule',
    importCode: `import {XLSXModule} from './xlsx/xlsx.module';`,
  },
};

module.exports = {
  ENABLED_PATH,
  ENABLED_MICROSERVICES,

  FRAMEWORK_SETTINGS_JSON,
  MICROSERVICES_MODULE_TS,
  MICROSERVICES_CONFIG_TS,

  PRISMA_SCHEMA_PATH,
  PRISMA_SCHEMA_APPLICATION,

  ENV_PATH,
  GIT_MODULES,

  LINE,
  ALL_MICROSERVICES,

  NEWBIE_DEVELOPER,
};
