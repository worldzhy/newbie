-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/engined";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/recruitment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/solidcore";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/tc-request";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/account";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/cloud";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/cron";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/event-scheduling";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/map";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/notification";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/order-mgmt";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/people-finder";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/project-mgmt";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/queue";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/stock-mgmt";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/storage";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/tag";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/third-notification";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/token";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/workflow";

-- CreateEnum
CREATE TYPE "microservice/account"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "microservice/account"."UserProfileGender" AS ENUM ('Male', 'Female', 'Intersex');

-- CreateEnum
CREATE TYPE "microservice/account"."PermissionAction" AS ENUM ('Manage', 'List', 'Get', 'Create', 'Update', 'Delete');

-- CreateEnum
CREATE TYPE "microservice/account"."TrustedEntityType" AS ENUM ('ORGANIZATION', 'ROLE', 'USER');

-- CreateEnum
CREATE TYPE "microservice/account"."VerificationCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "microservice/account"."VerificationCodeUse" AS ENUM ('UNKNOWN', 'LOGIN_BY_EMAIL', 'LOGIN_BY_PHONE', 'CLOSE_ACCOUNT_BY_EMAIL', 'CLOSE_ACCOUNT_BY_PHONE', 'RECOVER_ACCOUNT_BY_EMAIL', 'RECOVER_ACCOUNT_BY_PHONE', 'BIND_EMAIL', 'BIND_PHONE', 'CHANGE_PASSWORD', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "microservice/cloud"."AwsResourceStackState" AS ENUM ('PENDING', 'BUILD_PROCESSING', 'BUILD_SUCCEEDED', 'BUILD_FAILED', 'DESTROY_PROCESSING', 'DESTROY_SUCCEEDED', 'DESTROY_FAILED');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."AvailabilityExpressionStatus" AS ENUM ('EDITING', 'PUBLISHING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."AvailabilityTimeslotStatus" AS ENUM ('USABLE', 'USED');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."EventIssueType" AS ENUM ('ERROR_NONEXISTENT_COACH', 'ERROR_UNCONFIGURED_COACH', 'ERROR_UNAVAILABLE_EVENT_TIME', 'ERROR_CONFLICTING_EVENT_TIME', 'ERROR_UNAVAILABLE_EVENT_TYPE', 'ERROR_UNAVAILABLE_EVENT_VENUE', 'WARNING_HAS_MORE_SUITABLE_COACH');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."EventIssueStatus" AS ENUM ('UNREPAIRED', 'REPAIRED');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."EventContainerStatus" AS ENUM ('EDITING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."EventChangeLogType" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "microservice/event-scheduling"."EventStatus" AS ENUM ('EDITING', 'LOCKED', 'PUBLISHING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "microservice/queue"."QueueKeyType" AS ENUM ('STRING', 'HASH', 'LIST');

-- CreateEnum
CREATE TYPE "microservice/queue"."QueueTaskState" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "microservice/stock-mgmt"."UnitOfMeasurement" AS ENUM ('g', 'kg', 'piece', 'dozon');

-- CreateEnum
CREATE TYPE "microservice/stock-mgmt"."WarehouseType" AS ENUM ('Brand', 'Store', 'Supplier');

-- CreateEnum
CREATE TYPE "microservice/stock-mgmt"."DirectionOfStock" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "microservice/stock-mgmt"."TransactionType" AS ENUM ('Purchase', 'Split', 'Sell', 'Process', 'Loss');

-- CreateEnum
CREATE TYPE "microservice/workflow"."WorkflowViewComponentType" AS ENUM ('INFO_Title', 'INFO_Description', 'INFO_Image', 'INPUT_String', 'INPUT_Number', 'INPUT_Date', 'INPUT_File');

-- CreateEnum
CREATE TYPE "microservice/workflow"."WorkflowViewComponentTypePrefix" AS ENUM ('INFO', 'INPUT');

-- CreateEnum
CREATE TYPE "application/engined"."PostgresqlDatasourceState" AS ENUM ('LOADED', 'NOT_LOADED');

-- CreateEnum
CREATE TYPE "application/engined"."PostgresqlDatasourceConstraintKeyType" AS ENUM ('PRIMARY_KEY', 'FOREIGN_KEY');

-- CreateEnum
CREATE TYPE "application/engined"."ElasticsearchDatasourceState" AS ENUM ('LOADED', 'NOT_LOADED');

-- CreateEnum
CREATE TYPE "application/engined"."ElasticsearchDatasourceIndexState" AS ENUM ('NO_MAPPING', 'HAS_MAPPING');

-- CreateEnum
CREATE TYPE "application/engined"."DatatransMissionState" AS ENUM ('PENDING', 'SPLIT', 'STARTED', 'STOPPED');

-- CreateEnum
CREATE TYPE "application/engined"."DatatransTaskState" AS ENUM ('PENDING', 'IN_QUEUE', 'DONE');

-- CreateEnum
CREATE TYPE "application/engined"."ElasticsearchDataboardState" AS ENUM ('LOADED', 'NOT_LOADED');

-- CreateEnum
CREATE TYPE "application/engined"."ElasticsearchDataboardColumnFormatter" AS ENUM ('NONE', 'OVER_DUE', 'PAST_DUE', 'DATE_TIME', 'HIGHLIGHT_INCOMPLETE', 'CURRENCY');

-- CreateEnum
CREATE TYPE "application/recruitment"."CandidateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "application/recruitment"."JobType" AS ENUM ('Hourly', 'Salaried');

-- CreateEnum
CREATE TYPE "application/recruitment"."JobApplicationWorkflowTaskState" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "application/recruitment"."DocumentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "application/recruitment"."DocumentTypes" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "application/solidcore"."AsyncEventStatus" AS ENUM ('INIT', 'PENDING', 'REMOVING', 'REMOVED', 'PUBLISHING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "microservice/account"."Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."OrganizationRole" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" UUID,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "microservice/account"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."UserSingleProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT,
    "fullName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "suffix" TEXT,
    "dateOfBirth" DATE,
    "gender" "microservice/account"."UserProfileGender",
    "emails" JSONB[],
    "phones" JSONB[],
    "websites" JSONB,
    "picture" TEXT,
    "tagIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "eventVenueIds" INTEGER[],
    "eventTypeIds" INTEGER[],
    "eventHostTitle" TEXT,
    "eventHostPayRate" INTEGER,
    "quotaOfWeekMin" INTEGER,
    "quotaOfWeekMax" INTEGER,

    CONSTRAINT "UserSingleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."UserMultiProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT,
    "fullName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "suffix" TEXT,
    "dateOfBirth" DATE,
    "gender" "microservice/account"."UserProfileGender",
    "emails" JSONB[],
    "phones" JSONB[],
    "websites" JSONB,
    "picture" TEXT,
    "tagIds" INTEGER[],
    "organizationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserMultiProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."Permission" (
    "id" SERIAL NOT NULL,
    "action" "microservice/account"."PermissionAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "where" JSONB,
    "inverted" BOOLEAN,
    "reason" TEXT,
    "trustedEntityType" "microservice/account"."TrustedEntityType" NOT NULL,
    "trustedEntityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."VerificationCode" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "code" TEXT NOT NULL,
    "status" "microservice/account"."VerificationCodeStatus" NOT NULL,
    "use" "microservice/account"."VerificationCodeUse" NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."AccessToken" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/cloud"."AwsEnvironment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "awsAccountId" TEXT,
    "awsAccessKeyId" TEXT NOT NULL,
    "awsSecretAccessKey" TEXT NOT NULL,
    "awsRegion" TEXT NOT NULL,
    "s3ForCloudformation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwsEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/cloud"."AwsResourceStack" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "type" TEXT NOT NULL,
    "params" JSONB,
    "state" "microservice/cloud"."AwsResourceStackState" NOT NULL DEFAULT 'PENDING',
    "createStackOutput" JSONB,
    "describeStackOutput" JSONB,
    "deleteStackOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "environmentId" UUID NOT NULL,

    CONSTRAINT "AwsResourceStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/cron"."CronTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cronTime" TEXT NOT NULL,
    "running" BOOLEAN NOT NULL DEFAULT false,
    "command" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."AvailabilityExpression" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" "microservice/event-scheduling"."AvailabilityExpressionStatus" NOT NULL DEFAULT 'EDITING',
    "hostUserId" UUID NOT NULL,
    "venueIds" INTEGER[],
    "cronExpressionsOfAvailableTimePoints" TEXT[],
    "cronExpressionsOfUnavailableTimePoints" TEXT[],
    "dateOfOpening" TIMESTAMP(3) NOT NULL,
    "dateOfClosure" TIMESTAMP(3),
    "minutesOfDuration" INTEGER NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityExpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."AvailabilityTimeslot" (
    "id" SERIAL NOT NULL,
    "status" "microservice/event-scheduling"."AvailabilityTimeslotStatus" NOT NULL DEFAULT 'USABLE',
    "hostUserId" UUID NOT NULL,
    "venueIds" INTEGER[],
    "datetimeOfStart" TIMESTAMP(3) NOT NULL,
    "datetimeOfEnd" TIMESTAMP(3) NOT NULL,
    "minutesOfTimeslot" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expressionId" INTEGER NOT NULL,

    CONSTRAINT "AvailabilityTimeslot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."Event" (
    "id" SERIAL NOT NULL,
    "status" "microservice/event-scheduling"."EventStatus" NOT NULL DEFAULT 'EDITING',
    "hostUserId" UUID,
    "datetimeOfStart" TIMESTAMP(3) NOT NULL,
    "datetimeOfEnd" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "weekOfMonth" INTEGER NOT NULL,
    "weekOfYear" INTEGER NOT NULL,
    "minutesOfDuration" INTEGER NOT NULL,
    "mboData" JSONB,
    "aiInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "typeId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."EventIssue" (
    "id" SERIAL NOT NULL,
    "type" "microservice/event-scheduling"."EventIssueType" NOT NULL,
    "status" "microservice/event-scheduling"."EventIssueStatus" NOT NULL DEFAULT 'UNREPAIRED',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "EventIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."EventType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "minutesOfDuration" INTEGER NOT NULL,
    "minutesOfBreak" INTEGER,
    "minutesInAdvanceToReserve" INTEGER,
    "minutesInAdvanceToCancel" INTEGER,
    "tagId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."EventVenue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfSeats" INTEGER NOT NULL DEFAULT 1,
    "minutesOfBreak" INTEGER NOT NULL DEFAULT 0,
    "hourOfDayStart" INTEGER NOT NULL DEFAULT 6,
    "hourOfDayEnd" INTEGER NOT NULL DEFAULT 22,
    "minuteOfDayStart" INTEGER NOT NULL DEFAULT 0,
    "minuteOfDayEnd" INTEGER NOT NULL DEFAULT 0,
    "tagIds" INTEGER[],
    "placeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "similarVenueIds" INTEGER[],
    "preferredProgramId" INTEGER,
    "external_studioName" TEXT,
    "external_studioId" INTEGER,
    "external_locationId" INTEGER,
    "external_resourceId" INTEGER DEFAULT 1,
    "external_staffPayRate" INTEGER DEFAULT 10,
    "external_maxCapacity" INTEGER DEFAULT 20,
    "external_pricingOptionsProductIds" INTEGER[] DEFAULT ARRAY[1]::INTEGER[],
    "external_allowDateForwardEnrollment" BOOLEAN DEFAULT true,
    "external_allowOpenEnrollment" BOOLEAN DEFAULT true,
    "external_bookingStatus" TEXT DEFAULT 'Free',
    "external_waitlistCapacity" INTEGER DEFAULT 10,
    "external_webCapacity" INTEGER DEFAULT 10,

    CONSTRAINT "EventVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."EventContainer" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" "microservice/event-scheduling"."EventContainerStatus" NOT NULL DEFAULT 'EDITING',
    "dateOfOpening" TIMESTAMP(3),
    "dateOfClosure" TIMESTAMP(3),
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "venueId" INTEGER NOT NULL,

    CONSTRAINT "EventContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."EventChangeLog" (
    "id" SERIAL NOT NULL,
    "type" "microservice/event-scheduling"."EventChangeLogType" NOT NULL DEFAULT 'USER',
    "description" TEXT NOT NULL,
    "notedByUserId" UUID,
    "eventContainerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "EventChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/event-scheduling"."Reservation" (
    "id" SERIAL NOT NULL,
    "clientUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/storage"."LocalFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/storage"."GoogleFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "size" INTEGER,
    "iconLink" TEXT,
    "webViewLink" TEXT,
    "webContentLink" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/storage"."GoogleFilePermission" (
    "id" SERIAL NOT NULL,
    "permissionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "GoogleFilePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/storage"."S3File" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "s3Bucket" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Response" JSONB,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "S3File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/storage"."S3Bucket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "S3Bucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/map"."Place" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "timeZone" TEXT,
    "googleMapPlaceId" TEXT,
    "googleMapPlaceResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/notification"."EmailNotification" (
    "id" SERIAL NOT NULL,
    "payload" JSONB NOT NULL,
    "pinpointRequestId" TEXT,
    "pinpointMessageId" TEXT,
    "pinpointResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/notification"."SmsNotification" (
    "id" SERIAL NOT NULL,
    "payload" JSONB NOT NULL,
    "pinpointRequestId" TEXT,
    "pinpointMessageId" TEXT,
    "pinpointResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order-mgmt"."Order" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "totalTax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order-mgmt"."OrderItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "totalTax" DOUBLE PRECISION,
    "pieces" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order-mgmt"."StripePaymentIntent" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "StripePaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/project-mgmt"."Project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/project-mgmt"."ProjectNote" (
    "id" SERIAL NOT NULL,
    "section" TEXT,
    "label" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID,

    CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/queue"."Queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "keyType" "microservice/queue"."QueueKeyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/queue"."QueueTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "microservice/queue"."QueueTaskState" NOT NULL DEFAULT 'PENDING',
    "group" TEXT,
    "payload" JSONB NOT NULL,
    "bullJobId" TEXT,
    "sqsMessageId" TEXT,
    "sqsResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."Spu" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."Sku" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "unitOfMeasurement" "microservice/stock-mgmt"."UnitOfMeasurement" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spuId" UUID,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."Warehouse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "microservice/stock-mgmt"."WarehouseType" NOT NULL,
    "name" TEXT NOT NULL,
    "placeId" INTEGER,
    "tagIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."WarehouseSku" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" UUID NOT NULL,
    "skuId" UUID NOT NULL,

    CONSTRAINT "WarehouseSku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."SkuConversion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tagIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" UUID NOT NULL,

    CONSTRAINT "SkuConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."SkuConversionItem" (
    "id" SERIAL NOT NULL,
    "directionOfStock" "microservice/stock-mgmt"."DirectionOfStock" NOT NULL,
    "warehouseSkuId" INTEGER NOT NULL,
    "unitOfMeasurement" "microservice/stock-mgmt"."UnitOfMeasurement" NOT NULL,
    "valueOfMeasurement" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "skuConversionId" INTEGER NOT NULL,

    CONSTRAINT "SkuConversionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/stock-mgmt"."SkuTrail" (
    "id" SERIAL NOT NULL,
    "directionOfStock" "microservice/stock-mgmt"."DirectionOfStock" NOT NULL,
    "type" "microservice/stock-mgmt"."TransactionType" NOT NULL,
    "warehouseSkuId" INTEGER NOT NULL,
    "unitOfMeasurement" "microservice/stock-mgmt"."UnitOfMeasurement" NOT NULL,
    "valueOfMeasurement" DOUBLE PRECISION NOT NULL,
    "priceOfUnit" DOUBLE PRECISION NOT NULL,
    "priceOfTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" UUID NOT NULL,

    CONSTRAINT "SkuTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/tag"."Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/tag"."TagGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TagGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowView" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowViewComponent" (
    "id" SERIAL NOT NULL,
    "type" "microservice/workflow"."WorkflowViewComponentType" NOT NULL,
    "sort" INTEGER NOT NULL,
    "properties" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" INTEGER NOT NULL,

    CONSTRAINT "WorkflowViewComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowState" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowRoute" (
    "id" SERIAL NOT NULL,
    "startSign" BOOLEAN NOT NULL DEFAULT false,
    "viewId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "nextViewId" INTEGER NOT NULL,
    "nextRoleId" UUID,
    "nextUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/people-finder"."ContactSearch" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "userSource" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "companyDomain" TEXT,
    "linkedin" TEXT,
    "emails" JSONB[],
    "phones" JSONB[],
    "ctx" JSONB,
    "source" TEXT NOT NULL,
    "sourceMode" TEXT NOT NULL,
    "taskId" TEXT,
    "spent" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/people-finder"."ContactSearchTask" (
    "id" SERIAL NOT NULL,
    "contactSearchId" INTEGER,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSearchTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/third-notification"."ThirdNotificationAccount" (
    "id" SERIAL NOT NULL,
    "accessKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdNotificationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/third-notification"."ThirdNotificationChannel" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdNotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/third-notification"."ThirdNotificationRecord" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdNotificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."PostgresqlDatasource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "database" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "state" "application/engined"."PostgresqlDatasourceState" NOT NULL DEFAULT 'NOT_LOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostgresqlDatasource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."PostgresqlDatasourceConstraint" (
    "id" SERIAL NOT NULL,
    "schema" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "keyColumn" TEXT NOT NULL,
    "keyType" "application/engined"."PostgresqlDatasourceConstraintKeyType" NOT NULL,
    "foreignTable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datasourceId" UUID NOT NULL,

    CONSTRAINT "PostgresqlDatasourceConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."PostgresqlDatasourceTable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datasourceId" UUID NOT NULL,

    CONSTRAINT "PostgresqlDatasourceTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."PostgresqlDatasourceTableColumn" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "constraint" TEXT,
    "ordinalPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tableId" INTEGER NOT NULL,

    CONSTRAINT "PostgresqlDatasourceTableColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."ElasticsearchDatasource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "node" TEXT NOT NULL,
    "state" "application/engined"."ElasticsearchDatasourceState" NOT NULL DEFAULT 'NOT_LOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElasticsearchDatasource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."ElasticsearchDatasourceIndex" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "application/engined"."ElasticsearchDatasourceIndexState" NOT NULL DEFAULT 'NO_MAPPING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datasourceId" UUID NOT NULL,

    CONSTRAINT "ElasticsearchDatasourceIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."ElasticsearchDatasourceIndexField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "fields" JSONB,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "indexId" INTEGER NOT NULL,

    CONSTRAINT "ElasticsearchDatasourceIndexField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."DatatransPipeline" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "hasManyTables" TEXT[],
    "belongsToTables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromTableId" INTEGER NOT NULL,
    "toIndexId" INTEGER NOT NULL,

    CONSTRAINT "DatatransPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."DatatransMission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" "application/engined"."DatatransMissionState" NOT NULL DEFAULT 'PENDING',
    "numberOfRecords" INTEGER NOT NULL,
    "numberOfBatches" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datatransPipelineId" UUID NOT NULL,

    CONSTRAINT "DatatransMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."DatatransTask" (
    "id" SERIAL NOT NULL,
    "state" "application/engined"."DatatransTaskState" NOT NULL DEFAULT 'PENDING',
    "take" INTEGER NOT NULL,
    "skip" INTEGER NOT NULL,
    "sqsMessageId" TEXT,
    "sqsResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "missionId" UUID NOT NULL,

    CONSTRAINT "DatatransTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."ElasticsearchDataboard" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "state" "application/engined"."ElasticsearchDataboardState" NOT NULL DEFAULT 'NOT_LOADED',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datasourceIndexId" INTEGER NOT NULL,

    CONSTRAINT "ElasticsearchDataboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/engined"."ElasticsearchDataboardColumn" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ordinalPosition" INTEGER,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "width" INTEGER,
    "copyable" BOOLEAN,
    "searchable" BOOLEAN,
    "sortable" BOOLEAN,
    "tooltip" TEXT,
    "formatter" "application/engined"."ElasticsearchDataboardColumnFormatter" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "databoardId" UUID NOT NULL,
    "datasourceIndexFieldId" INTEGER NOT NULL,

    CONSTRAINT "ElasticsearchDataboardColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."Candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "application/recruitment"."CandidateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "placeId" INTEGER,
    "organizationId" UUID,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."CandidateProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "uniqueNumber" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "middleName" TEXT,
    "familyName" TEXT NOT NULL,
    "fullName" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "email" TEXT,
    "primaryPhone" TEXT NOT NULL,
    "primaryPhoneExt" TEXT,
    "alternatePhone" TEXT,
    "alternatePhoneExt" TEXT,
    "websites" JSONB,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" UUID NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."CandidateCertification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" UUID NOT NULL,

    CONSTRAINT "CandidateCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."CandidateTraining" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" UUID NOT NULL,

    CONSTRAINT "CandidateTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "type" "application/recruitment"."JobType" NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "placeId" INTEGER,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "state" TEXT,
    "jobType" "application/recruitment"."JobType" NOT NULL,
    "jobCode" TEXT,
    "jobSite" TEXT NOT NULL,
    "testTypes" TEXT[],
    "referredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateUserId" UUID NOT NULL,
    "candidateId" UUID,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobApplicationId" UUID NOT NULL,
    "beingHeldByUserId" UUID,
    "stateId" INTEGER NOT NULL,
    "nextViewId" INTEGER NOT NULL,
    "nextRoleId" TEXT,
    "processedByUserIds" TEXT[],

    CONSTRAINT "JobApplicationWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowTrail" (
    "id" SERIAL NOT NULL,
    "viewId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "nextViewId" INTEGER NOT NULL,
    "nextRoleId" UUID,
    "processedByUserId" UUID NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "JobApplicationWorkflowTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowPayload" (
    "id" SERIAL NOT NULL,
    "testType" TEXT,
    "testSite" TEXT,
    "appointmentStartsAt" TIMESTAMP(3),
    "appointmentEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "JobApplicationWorkflowPayload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowFile" (
    "id" SERIAL NOT NULL,
    "fileId" UUID NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,
    "workflowStepId" INTEGER NOT NULL,

    CONSTRAINT "JobApplicationWorkflowFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowNote" (
    "id" SERIAL NOT NULL,
    "reporter" TEXT,
    "reporterUserId" UUID NOT NULL,
    "reporterComment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "JobApplicationWorkflowNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowTask" (
    "id" SERIAL NOT NULL,
    "reporter" TEXT,
    "reporterUserId" UUID NOT NULL,
    "reporterComment" TEXT NOT NULL,
    "assignee" TEXT,
    "assigneeUserId" UUID NOT NULL,
    "state" "application/recruitment"."JobApplicationWorkflowTaskState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "JobApplicationWorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."File" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "localPath" TEXT,
    "localName" TEXT,
    "s3Bucket" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" UUID,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."Folder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."Document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "application/recruitment"."DocumentTypes" NOT NULL DEFAULT 'DRAFT',
    "status" "application/recruitment"."DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT,
    "templateType" TEXT,
    "description" TEXT,
    "validStartsAt" TIMESTAMP(3),
    "validEndsAt" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "approvalName" TEXT,
    "organizationId" UUID,
    "documentTemplateId" UUID,
    "fileId" UUID,
    "sourceDocumentId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."DocumentContent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company" TEXT,
    "deptArea" TEXT,
    "location" TEXT,
    "familyDept" TEXT,
    "jobAddress" TEXT,
    "jobAnalyst" TEXT,
    "jobSummary" TEXT,
    "patientFacing" TEXT,
    "dateOfAnalysis" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" UUID,

    CONSTRAINT "DocumentContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."DocumentContentJobCode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentContentId" UUID,

    CONSTRAINT "DocumentContentJobCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."DocumentContentEssentialFunction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentContentId" UUID,

    CONSTRAINT "DocumentContentEssentialFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."DocumentHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" UUID NOT NULL,
    "newContent" JSONB NOT NULL,
    "oldContent" JSONB,
    "processedByUserIds" TEXT[],

    CONSTRAINT "DocumentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."DocumentTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "schemaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" UUID,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/solidcore"."MindbodySite" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "siteName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindbodySite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/solidcore"."AsyncPublish" (
    "id" SERIAL NOT NULL,
    "status" "application/solidcore"."AsyncEventStatus" NOT NULL DEFAULT 'INIT',
    "containerId" INTEGER NOT NULL,
    "curOldEvents" INTEGER NOT NULL DEFAULT 0,
    "oldEvents" INTEGER NOT NULL DEFAULT 0,
    "curEventsCnt" INTEGER NOT NULL DEFAULT 0,
    "eventsCnt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsyncPublish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/solidcore"."mboLog" (
    "id" SERIAL NOT NULL,
    "asyncPublishId" INTEGER,
    "containerId" INTEGER,
    "eventId" INTEGER,
    "funcName" TEXT,
    "studioId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "params" JSONB,
    "resp" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mboLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/tc-request"."TcWorkflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registrationNumber" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL,
    "reasonForRefusal" TEXT,
    "parentId" INTEGER NOT NULL,
    "fileIdForCertificate" TEXT,
    "title" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "dateOfBirth" DATE,
    "gender" TEXT,
    "address" TEXT,
    "island" TEXT,
    "district" TEXT,
    "addressOutsideTC" TEXT,
    "landlinePhone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "fileIdForRecentPhoto" UUID,
    "purpose" TEXT,
    "typeOfEmployment" TEXT,
    "countryOfTravel" TEXT,
    "otherPurpose" TEXT,
    "intendedDateOfTravel" DATE,
    "fileIdForTravelProof" TEXT,
    "otherInformation" TEXT,
    "scopeOfConvictions" TEXT,
    "hasOutsideConviction" BOOLEAN,
    "outsideConviction" TEXT,
    "maritalStatus" TEXT,
    "isNameChanged" BOOLEAN,
    "preFirstName" TEXT,
    "preMiddleName" TEXT,
    "preLastName" TEXT,
    "occupation" TEXT,
    "nameOfEmployer" TEXT,
    "addressOfEmployer" TEXT,
    "telephoneOfEmployer" TEXT,
    "emailOfEmployer" TEXT,
    "isTcUk" BOOLEAN,
    "isTc" BOOLEAN,
    "fileIdOfTcPassport" UUID,
    "fileIdOfTcCertificate" UUID,
    "fileIdOfUkPassport" UUID,
    "fileIdOfUkCertificate" UUID,
    "fileIdOfForeignPassport" UUID,
    "fileIdOfForeignCertificate" UUID,
    "passportNumber" TEXT,
    "dateOfIssue" DATE,
    "dateOfExpiry" DATE,
    "countryOfIssue" TEXT,
    "placeOfBirth" TEXT,
    "statusCardNumber" TEXT,
    "dateOfStatusCardIssue" DATE,
    "dateOfRequest" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "view" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "nextView" TEXT NOT NULL,
    "nextRoleId" TEXT,
    "processedByUserIds" TEXT[],

    CONSTRAINT "TcWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/tc-request"."TcWorkflowTrail" (
    "id" SERIAL NOT NULL,
    "view" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "nextView" TEXT NOT NULL,
    "nextRoleId" UUID,
    "processedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "TcWorkflowTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/account"."_RoleToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_name_organizationId_key" ON "microservice/account"."OrganizationRole"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "microservice/account"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "microservice/account"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserSingleProfile_userId_key" ON "microservice/account"."UserSingleProfile"("userId");

-- CreateIndex
CREATE INDEX "UserSingleProfile_userId_idx" ON "microservice/account"."UserSingleProfile"("userId");

-- CreateIndex
CREATE INDEX "UserMultiProfile_userId_idx" ON "microservice/account"."UserMultiProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "microservice/account"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AwsResourceStack_name_key" ON "microservice/cloud"."AwsResourceStack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CronTask_name_key" ON "microservice/cron"."CronTask"("name");

-- CreateIndex
CREATE INDEX "AvailabilityTimeslot_hostUserId_venueIds_datetimeOfStart_da_idx" ON "microservice/event-scheduling"."AvailabilityTimeslot"("hostUserId", "venueIds", "datetimeOfStart", "datetimeOfEnd");

-- CreateIndex
CREATE INDEX "Event_containerId_year_month_weekOfMonth_deletedAt_idx" ON "microservice/event-scheduling"."Event"("containerId", "year", "month", "weekOfMonth", "deletedAt");

-- CreateIndex
CREATE INDEX "Event_hostUserId_venueId_datetimeOfStart_datetimeOfEnd_dele_idx" ON "microservice/event-scheduling"."Event"("hostUserId", "venueId", "datetimeOfStart", "datetimeOfEnd", "deletedAt");

-- CreateIndex
CREATE INDEX "Event_deletedAt_idx" ON "microservice/event-scheduling"."Event"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "microservice/project-mgmt"."Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseSku_warehouseId_skuId_key" ON "microservice/stock-mgmt"."WarehouseSku"("warehouseId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_name_key" ON "microservice/workflow"."Workflow"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowView_name_workflowId_key" ON "microservice/workflow"."WorkflowView"("name", "workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowState_name_workflowId_key" ON "microservice/workflow"."WorkflowState"("name", "workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRoute_viewId_stateId_key" ON "microservice/workflow"."WorkflowRoute"("viewId", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_candidateId_key" ON "application/recruitment"."CandidateProfile"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationWorkflowPayload_workflowId_key" ON "application/recruitment"."JobApplicationWorkflowPayload"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_key" ON "application/recruitment"."Folder"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContent_documentId_key" ON "application/recruitment"."DocumentContent"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "MindbodySite_siteId_key" ON "application/solidcore"."MindbodySite"("siteId");

-- CreateIndex
CREATE INDEX "mboLog_funcName_idx" ON "application/solidcore"."mboLog"("funcName");

-- CreateIndex
CREATE INDEX "mboLog_containerId_idx" ON "application/solidcore"."mboLog"("containerId");

-- CreateIndex
CREATE INDEX "mboLog_studioId_locationId_idx" ON "application/solidcore"."mboLog"("studioId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "microservice/account"."_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "microservice/account"."_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "microservice/account"."OrganizationRole" ADD CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "microservice/account"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/account"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "microservice/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/account"."UserSingleProfile" ADD CONSTRAINT "UserSingleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "microservice/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/account"."UserMultiProfile" ADD CONSTRAINT "UserMultiProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "microservice/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/cloud"."AwsResourceStack" ADD CONSTRAINT "AwsResourceStack_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "microservice/cloud"."AwsEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."AvailabilityTimeslot" ADD CONSTRAINT "AvailabilityTimeslot_expressionId_fkey" FOREIGN KEY ("expressionId") REFERENCES "microservice/event-scheduling"."AvailabilityExpression"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."Event" ADD CONSTRAINT "Event_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "microservice/event-scheduling"."EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "microservice/event-scheduling"."EventVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."Event" ADD CONSTRAINT "Event_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "microservice/event-scheduling"."EventContainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."EventIssue" ADD CONSTRAINT "EventIssue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "microservice/event-scheduling"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."EventContainer" ADD CONSTRAINT "EventContainer_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "microservice/event-scheduling"."EventVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."EventChangeLog" ADD CONSTRAINT "EventChangeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "microservice/event-scheduling"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/event-scheduling"."Reservation" ADD CONSTRAINT "Reservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "microservice/event-scheduling"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/storage"."GoogleFilePermission" ADD CONSTRAINT "GoogleFilePermission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "microservice/storage"."GoogleFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order-mgmt"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "microservice/order-mgmt"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order-mgmt"."StripePaymentIntent" ADD CONSTRAINT "StripePaymentIntent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "microservice/order-mgmt"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/project-mgmt"."ProjectNote" ADD CONSTRAINT "ProjectNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "microservice/project-mgmt"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."Sku" ADD CONSTRAINT "Sku_spuId_fkey" FOREIGN KEY ("spuId") REFERENCES "microservice/stock-mgmt"."Spu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."WarehouseSku" ADD CONSTRAINT "WarehouseSku_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "microservice/stock-mgmt"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."WarehouseSku" ADD CONSTRAINT "WarehouseSku_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "microservice/stock-mgmt"."Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."SkuConversion" ADD CONSTRAINT "SkuConversion_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "microservice/stock-mgmt"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."SkuConversionItem" ADD CONSTRAINT "SkuConversionItem_skuConversionId_fkey" FOREIGN KEY ("skuConversionId") REFERENCES "microservice/stock-mgmt"."SkuConversion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/stock-mgmt"."SkuTrail" ADD CONSTRAINT "SkuTrail_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "microservice/stock-mgmt"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/tag"."Tag" ADD CONSTRAINT "Tag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "microservice/tag"."TagGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowView" ADD CONSTRAINT "WorkflowView_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "microservice/workflow"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowViewComponent" ADD CONSTRAINT "WorkflowViewComponent_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "microservice/workflow"."WorkflowView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowState" ADD CONSTRAINT "WorkflowState_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "microservice/workflow"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowRoute" ADD CONSTRAINT "WorkflowRoute_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "microservice/workflow"."WorkflowView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowRoute" ADD CONSTRAINT "WorkflowRoute_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "microservice/workflow"."WorkflowState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowRoute" ADD CONSTRAINT "WorkflowRoute_nextViewId_fkey" FOREIGN KEY ("nextViewId") REFERENCES "microservice/workflow"."WorkflowView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/people-finder"."ContactSearchTask" ADD CONSTRAINT "ContactSearchTask_contactSearchId_fkey" FOREIGN KEY ("contactSearchId") REFERENCES "microservice/people-finder"."ContactSearch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/third-notification"."ThirdNotificationChannel" ADD CONSTRAINT "ThirdNotificationChannel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "microservice/third-notification"."ThirdNotificationAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/third-notification"."ThirdNotificationRecord" ADD CONSTRAINT "ThirdNotificationRecord_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "microservice/third-notification"."ThirdNotificationChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."PostgresqlDatasourceConstraint" ADD CONSTRAINT "PostgresqlDatasourceConstraint_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "application/engined"."PostgresqlDatasource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."PostgresqlDatasourceTable" ADD CONSTRAINT "PostgresqlDatasourceTable_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "application/engined"."PostgresqlDatasource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."PostgresqlDatasourceTableColumn" ADD CONSTRAINT "PostgresqlDatasourceTableColumn_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "application/engined"."PostgresqlDatasourceTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."ElasticsearchDatasourceIndex" ADD CONSTRAINT "ElasticsearchDatasourceIndex_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "application/engined"."ElasticsearchDatasource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."ElasticsearchDatasourceIndexField" ADD CONSTRAINT "ElasticsearchDatasourceIndexField_indexId_fkey" FOREIGN KEY ("indexId") REFERENCES "application/engined"."ElasticsearchDatasourceIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."DatatransPipeline" ADD CONSTRAINT "DatatransPipeline_fromTableId_fkey" FOREIGN KEY ("fromTableId") REFERENCES "application/engined"."PostgresqlDatasourceTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."DatatransPipeline" ADD CONSTRAINT "DatatransPipeline_toIndexId_fkey" FOREIGN KEY ("toIndexId") REFERENCES "application/engined"."ElasticsearchDatasourceIndex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."DatatransMission" ADD CONSTRAINT "DatatransMission_datatransPipelineId_fkey" FOREIGN KEY ("datatransPipelineId") REFERENCES "application/engined"."DatatransPipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."DatatransTask" ADD CONSTRAINT "DatatransTask_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "application/engined"."DatatransMission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."ElasticsearchDataboard" ADD CONSTRAINT "ElasticsearchDataboard_datasourceIndexId_fkey" FOREIGN KEY ("datasourceIndexId") REFERENCES "application/engined"."ElasticsearchDatasourceIndex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."ElasticsearchDataboardColumn" ADD CONSTRAINT "ElasticsearchDataboardColumn_databoardId_fkey" FOREIGN KEY ("databoardId") REFERENCES "application/engined"."ElasticsearchDataboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/engined"."ElasticsearchDataboardColumn" ADD CONSTRAINT "ElasticsearchDataboardColumn_datasourceIndexFieldId_fkey" FOREIGN KEY ("datasourceIndexFieldId") REFERENCES "application/engined"."ElasticsearchDatasourceIndexField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."Candidate" ADD CONSTRAINT "Candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "microservice/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateProfile" ADD CONSTRAINT "CandidateProfile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateCertification" ADD CONSTRAINT "CandidateCertification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateTraining" ADD CONSTRAINT "CandidateTraining_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplication" ADD CONSTRAINT "JobApplication_candidateUserId_fkey" FOREIGN KEY ("candidateUserId") REFERENCES "microservice/account"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflow" ADD CONSTRAINT "JobApplicationWorkflow_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "application/recruitment"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflow" ADD CONSTRAINT "JobApplicationWorkflow_beingHeldByUserId_fkey" FOREIGN KEY ("beingHeldByUserId") REFERENCES "microservice/account"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowTrail" ADD CONSTRAINT "JobApplicationWorkflowTrail_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowPayload" ADD CONSTRAINT "JobApplicationWorkflowPayload_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowFile" ADD CONSTRAINT "JobApplicationWorkflowFile_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowNote" ADD CONSTRAINT "JobApplicationWorkflowNote_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowTask" ADD CONSTRAINT "JobApplicationWorkflowTask_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "application/recruitment"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "microservice/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."Document" ADD CONSTRAINT "Document_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "application/recruitment"."DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."Document" ADD CONSTRAINT "Document_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "application/recruitment"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."DocumentContent" ADD CONSTRAINT "DocumentContent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "application/recruitment"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."DocumentContentJobCode" ADD CONSTRAINT "DocumentContentJobCode_documentContentId_fkey" FOREIGN KEY ("documentContentId") REFERENCES "application/recruitment"."DocumentContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."DocumentContentEssentialFunction" ADD CONSTRAINT "DocumentContentEssentialFunction_documentContentId_fkey" FOREIGN KEY ("documentContentId") REFERENCES "application/recruitment"."DocumentContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."DocumentHistory" ADD CONSTRAINT "DocumentHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "application/recruitment"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "microservice/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/tc-request"."TcWorkflowTrail" ADD CONSTRAINT "TcWorkflowTrail_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/tc-request"."TcWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/account"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "microservice/account"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/account"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "microservice/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

