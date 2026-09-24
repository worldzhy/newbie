/**
 * Catalog of newbie modules (Stage 3a: still the legacy git-submodule model).
 *
 * Each entry describes where the module lives in the consuming project, where
 * its repository is, and the NestJS wiring generated into microservices.module.ts.
 * Stage 3c replaces this hardcoded catalog with the modules.json registry model.
 */

export const SAAS_MODULE = "saas";
export const ACCOUNT_MODULE = "account";

export interface ModuleMeta {
  key: string;
  srcPath: string;
  repositoryUrl: string;
  schemaFileName: string | null;
  settingsFileName: string | null;
  moduleNames: string;
  importCode: string;
}

function module(
  key: string,
  moduleFileName: string,
  className: string,
  options?: Partial<Pick<ModuleMeta, "schemaFileName" | "settingsFileName">>,
): ModuleMeta {
  return {
    key,
    srcPath: `src/microservices/${key}`,
    repositoryUrl: `https://github.com/worldzhy/newbie.${key}.git`,
    schemaFileName:
      options?.schemaFileName === undefined
        ? `${key}.schema`
        : options.schemaFileName,
    settingsFileName:
      options?.settingsFileName === undefined
        ? `${key}.settings.json`
        : options.settingsFileName,
    moduleNames: className,
    importCode: `import {${className}} from './${key}/${moduleFileName}.module';`,
  };
}

export const MODULES: Record<string, ModuleMeta> = {
  saas: module("saas", "saas", "SaasModule"),
  account: module("account", "account", "AccountModule"),
  "aws-audit": module("aws-audit", "aws-audit", "AwsAuditModule"),
  "aws-cloudwatch": module(
    "aws-cloudwatch",
    "aws-cloudwatch",
    "AwsCloudwatchModule",
  ),
  "aws-core": module("aws-core", "aws-core", "AwsCoreModule"),
  "aws-s3": module("aws-s3", "aws-s3", "AwsS3Module"),
  "aws-secrets-manager": module(
    "aws-secrets-manager",
    "aws-secrets-manager",
    "AwsSecretsManagerModule",
  ),
  "aws-ses": module("aws-ses", "aws-ses", "AwsSesModule", {
    schemaFileName: null,
  }),
  "aws-sms": module("aws-sms", "aws-sms", "AwsSmsModule", {
    schemaFileName: null,
  }),
  "aws-sqs": module("aws-sqs", "aws-sqs", "AwsSqsModule", {
    schemaFileName: null,
  }),
  cache: module("cache", "cache", "NewbieCacheModule", {
    schemaFileName: null,
  }),
  clickhouse: module("clickhouse", "clickhouse", "ClickhouseModule", {
    schemaFileName: null,
  }),
  cloudformation: module(
    "cloudformation",
    "cloudformation",
    "AwsCloudformationModule",
  ),
  cloudinary: module("cloudinary", "cloudinary", "CloudinaryModule", {
    schemaFileName: null,
  }),
  elasticsearch: module(
    "elasticsearch",
    "elasticsearch",
    "ElasticsearchModule",
    { schemaFileName: null },
  ),
  engined: module("engined", "engined", "EnginedModule", {
    settingsFileName: null,
  }),
  "event-scheduling": module(
    "event-scheduling",
    "event-scheduling",
    "EventSchedulingModule",
  ),
  "frontend-monitor": module(
    "frontend-monitor",
    "frontend-monitor",
    "FrontendMonitorModule",
    { schemaFileName: null },
  ),
  github: module("github", "github", "GitHubModule", { schemaFileName: null }),
  googleapis: module("googleapis", "googleapis", "GoogleAPIsModule"),
  googlemaps: module("googlemaps", "googlemaps", "GoogleMapsModule"),
  "lark-bot": module("lark-bot", "lark-bot", "LarkBotModule", {
    schemaFileName: null,
    settingsFileName: null,
  }),
  "llm-agent": module("llm-agent", "llm-agent", "LlmAgentModule", {
    settingsFileName: null,
  }),
  "local-storage": module(
    "local-storage",
    "local-storage",
    "LocalStorageModule",
  ),
  map: module("map", "map", "MapModule", { settingsFileName: null }),
  membership: module("membership", "membership", "MembershipModule", {
    settingsFileName: null,
  }),
  "message-bot": module("message-bot", "message-bot", "MessageBotModule"),
  "message-tracker": module(
    "message-tracker",
    "message-tracker",
    "MessageTrackerModule",
  ),
  mongo: module("mongo", "mongo", "MongoModule", { schemaFileName: null }),
  notification: module("notification", "notification", "NotificationModule"),
  order: module("order", "order", "OrderModule"),
  organization: module("organization", "organization", "OrganizationModule", {
    settingsFileName: null,
  }),
  pdf: module("pdf", "pdf", "PdfModule", { schemaFileName: null }),
  "people-finder": module(
    "people-finder",
    "people-finder",
    "PeopleFinderModule",
  ),
  puppeteer: module("puppeteer", "puppeteer", "PuppeteerModule", {
    schemaFileName: null,
  }),
  queue: module("queue", "queue", "NewbieQueueModule"),
  shortcut: module("shortcut", "shortcut", "ShortcutModule", {
    settingsFileName: null,
  }),
  slack: module("slack", "slack", "SlackModule", { schemaFileName: null }),
  snowflake: module("snowflake", "snowflake", "SnowflakeModule", {
    schemaFileName: null,
  }),
  "stock-mgmt": module("stock-mgmt", "stock-mgmt", "StockManagementModule", {
    settingsFileName: null,
  }),
  tag: module("tag", "tag", "TagModule", { settingsFileName: null }),
  "task-scheduling": module(
    "task-scheduling",
    "task-scheduling",
    "TaskSchedulingModule",
  ),
  "task-management": module(
    "task-management",
    "task-management",
    "TaskManagementModule",
    { settingsFileName: null },
  ),
  "tencent-cos": module("tencent-cos", "tencent-cos", "TencentCosModule"),
  webhook: module("webhook", "webhook", "WebhookModule"),
  workflow: module("workflow", "workflow", "WorkflowModule", {
    settingsFileName: null,
  }),
  xlsx: module("xlsx", "xlsx", "XLSXModule", { schemaFileName: null }),
};

export const ALL_MODULE_NAMES = Object.keys(MODULES);
