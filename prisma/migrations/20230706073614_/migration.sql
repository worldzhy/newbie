-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/account";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/engined";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/pmgmt";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/recruitment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "application/tc-request";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/fmgmt";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/location";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/notification";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/order";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/task";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/verification-code";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "microservice/workflow";

-- CreateEnum
CREATE TYPE "microservice/task"."TaskState" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "microservice/verification-code"."VerificationCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "microservice/verification-code"."VerificationCodeUse" AS ENUM ('UNKNOWN', 'LOGIN_BY_EMAIL', 'LOGIN_BY_PHONE', 'CLOSE_ACCOUNT_BY_EMAIL', 'CLOSE_ACCOUNT_BY_PHONE', 'RECOVER_ACCOUNT_BY_EMAIL', 'RECOVER_ACCOUNT_BY_PHONE', 'BIND_EMAIL', 'BIND_PHONE', 'CHANGE_PASSWORD', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "microservice/workflow"."WorkflowNodeType" AS ENUM ('VIEW');

-- CreateEnum
CREATE TYPE "application/account"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "application/account"."UserTokenStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "application/account"."UserProfileGender" AS ENUM ('Male', 'Female', 'Intersex');

-- CreateEnum
CREATE TYPE "application/account"."PermissionAction" AS ENUM ('List', 'Get', 'Create', 'Update', 'Delete');

-- CreateEnum
CREATE TYPE "application/account"."TrustedEntityType" AS ENUM ('ORGANIZATION', 'ROLE', 'USER');

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
CREATE TYPE "application/pmgmt"."ProjectState" AS ENUM ('PLANNING', 'DESIGNING', 'DEVELOPING', 'DONE');

-- CreateEnum
CREATE TYPE "application/pmgmt"."ProjectCheckpointType" AS ENUM ('MANAGER_PRODUCT_REQUIREMENTS', 'MANAGER_PROJECT_KANBAN', 'DESIGNER_WIREFRAMES', 'DESIGNER_PROTOTYPES', 'DEVELOPER_ACCOUNT_APPLE', 'DEVELOPER_ACCOUNT_GOOGLE', 'DEVELOPER_BACKEND_REPO', 'DEVELOPER_BACKEND_FRAMEWORK', 'DEVELOPER_BACKEND_DATABASE', 'DEVELOPER_BACKEND_API', 'DEVELOPER_FRONTEND_REPO', 'DEVELOPER_FRONTEND_FRAMEWORK', 'DEVELOPER_INFRASTRUCTURE');

-- CreateEnum
CREATE TYPE "application/pmgmt"."ProjectCheckpointState" AS ENUM ('TODO', 'PROCESSING', 'DONE');

-- CreateEnum
CREATE TYPE "application/pmgmt"."ProjectEnvironmentType" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "application/pmgmt"."CloudFormationStackType" AS ENUM ('CICD_BUILD', 'CICD_PIPELINE', 'CICD_REPOSITORY', 'COMPUTING_FARGATE', 'NETWORK_HIPAA', 'PRODUCT_DATA_ENGINE', 'PRODUCT_MESSAGE_TRACKER');

-- CreateEnum
CREATE TYPE "application/pmgmt"."CloudFormationStackState" AS ENUM ('PENDING', 'BUILD', 'DESTROYED');

-- CreateEnum
CREATE TYPE "application/pmgmt"."PulumiStackType" AS ENUM ('AWS_CLOUDFRONT', 'AWS_CODE_COMMIT', 'AWS_ECR', 'AWS_ECS', 'AWS_EKS', 'AWS_IAM_USER', 'AWS_RDS', 'AWS_S3', 'AWS_SQS', 'AWS_VPC', 'AWS_WAF', 'COMPUTING_FARGATE', 'NETWORK_HIPAA');

-- CreateEnum
CREATE TYPE "application/pmgmt"."PulumiStackState" AS ENUM ('PENDING', 'BUILD_PROCESSING', 'BUILD_SUCCEEDED', 'BUILD_FAILED', 'DESTROY_PROCESSING', 'DESTROY_SUCCEEDED', 'DESTROY_FAILED');

-- CreateEnum
CREATE TYPE "application/recruitment"."CandidateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "application/recruitment"."JobType" AS ENUM ('Hourly', 'Salaried');

-- CreateEnum
CREATE TYPE "application/recruitment"."JobApplicationWorkflowTaskState" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "microservice/fmgmt"."File" (
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
    "folderId" INTEGER,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/fmgmt"."Folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/location"."Location" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "geoJSON" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "microservice/order"."Order" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "totalTax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order"."OrderItem" (
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
CREATE TABLE "microservice/order"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "identificationNumber" TEXT,
    "taxIdentificationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order"."Address" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zipcode" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/order"."StripePaymentIntent" (
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
CREATE TABLE "microservice/task"."Task" (
    "id" SERIAL NOT NULL,
    "state" "microservice/task"."TaskState" NOT NULL DEFAULT 'PENDING',
    "group" TEXT,
    "payload" JSONB NOT NULL,
    "sqsMessageId" TEXT,
    "sqsResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/verification-code"."VerificationCode" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "code" TEXT NOT NULL,
    "status" "microservice/verification-code"."VerificationCodeStatus" NOT NULL,
    "use" "microservice/verification-code"."VerificationCodeUse" NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "microservice/workflow"."WorkflowNode" (
    "id" SERIAL NOT NULL,
    "type" "microservice/workflow"."WorkflowNodeType" NOT NULL,
    "startSign" BOOLEAN,
    "endSign" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowView" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startSign" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microservice/workflow"."WorkflowViewComponent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowViewId" INTEGER,

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
    "startSign" BOOLEAN,
    "view" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "nextView" TEXT NOT NULL,
    "nextRoleId" UUID,
    "nextUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" UUID,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "phone" TEXT,
    "username" TEXT,
    "password" TEXT,
    "status" "application/account"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."UserToken" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "status" "application/account"."UserTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."UserProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "suffix" TEXT,
    "dateOfBirth" DATE,
    "gender" "application/account"."UserProfileGender",
    "emails" JSONB[],
    "phones" JSONB[],
    "websites" JSONB,
    "picture" TEXT,
    "organizationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."RoutePermission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route" TEXT NOT NULL,
    "trustedEntityType" "application/account"."TrustedEntityType" NOT NULL,
    "trustedEntityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."ComponentPermission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "component" TEXT NOT NULL,
    "trustedEntityType" "application/account"."TrustedEntityType" NOT NULL,
    "trustedEntityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."EndpointPermission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "endpoint" TEXT NOT NULL,
    "trustedEntityType" "application/account"."TrustedEntityType" NOT NULL,
    "trustedEntityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/account"."Permission" (
    "id" SERIAL NOT NULL,
    "action" "application/account"."PermissionAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "where" JSONB,
    "inverted" BOOLEAN,
    "reason" TEXT,
    "trustedEntityType" "application/account"."TrustedEntityType" NOT NULL,
    "trustedEntityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "application/pmgmt"."Project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "state" "application/pmgmt"."ProjectState" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/pmgmt"."ProjectElement" (
    "id" SERIAL NOT NULL,
    "section" TEXT,
    "label" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID,

    CONSTRAINT "ProjectElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/pmgmt"."ProjectCheckpoint" (
    "id" SERIAL NOT NULL,
    "type" "application/pmgmt"."ProjectCheckpointType" NOT NULL,
    "state" "application/pmgmt"."ProjectCheckpointState" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "ProjectCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/pmgmt"."ProjectEnvironment" (
    "id" SERIAL NOT NULL,
    "type" "application/pmgmt"."ProjectEnvironmentType" NOT NULL,
    "awsAccountId" TEXT,
    "awsProfile" TEXT,
    "awsAccessKeyId" TEXT,
    "awsSecretAccessKey" TEXT,
    "awsRegion" TEXT,
    "s3ForCloudformation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "ProjectEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/pmgmt"."CloudFormationStack" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "type" "application/pmgmt"."CloudFormationStackType" NOT NULL,
    "params" JSONB,
    "state" "application/pmgmt"."CloudFormationStackState" NOT NULL DEFAULT 'PENDING',
    "environment" "application/pmgmt"."ProjectEnvironmentType" NOT NULL,
    "createStackOutput" JSONB,
    "describeStackOutput" JSONB,
    "deleteStackOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "CloudFormationStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/pmgmt"."PulumiStack" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "type" "application/pmgmt"."PulumiStackType" NOT NULL,
    "params" JSONB,
    "state" "application/pmgmt"."PulumiStackState" NOT NULL DEFAULT 'PENDING',
    "environment" "application/pmgmt"."ProjectEnvironmentType" NOT NULL,
    "upResult" JSONB,
    "destroyResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "PulumiStack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."Candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "application/recruitment"."CandidateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationId" UUID,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."CandidateProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "uniqueNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT,
    "dateOfBirth" DATE,
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
    "locationId" UUID,

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
    "candidateId" UUID NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobApplicationId" UUID NOT NULL,
    "beingHeldByUserId" UUID,
    "state" TEXT NOT NULL,
    "nextStep" TEXT NOT NULL,
    "nextRoleId" TEXT,
    "processedByUserIds" TEXT[],

    CONSTRAINT "JobApplicationWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application/recruitment"."JobApplicationWorkflowStep" (
    "id" SERIAL NOT NULL,
    "step" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "nextStep" TEXT NOT NULL,
    "nextRoleId" UUID,
    "processedByUserId" UUID NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" UUID NOT NULL,

    CONSTRAINT "JobApplicationWorkflowStep_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "application/tc-request"."TcWorkflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registrationNumber" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL,
    "reasonForRefusal" TEXT,
    "folderId" INTEGER NOT NULL,
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
CREATE TABLE "application/account"."_RoleToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_key" ON "microservice/fmgmt"."Folder"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_name_key" ON "microservice/workflow"."Workflow"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowNode_startSign_key" ON "microservice/workflow"."WorkflowNode"("startSign");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowNode_endSign_key" ON "microservice/workflow"."WorkflowNode"("endSign");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowView_name_key" ON "microservice/workflow"."WorkflowView"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowView_startSign_key" ON "microservice/workflow"."WorkflowView"("startSign");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRoute_startSign_key" ON "microservice/workflow"."WorkflowRoute"("startSign");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRoute_view_state_key" ON "microservice/workflow"."WorkflowRoute"("view", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_organizationId_key" ON "application/account"."Role"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "application/account"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "application/account"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "application/account"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "application/pmgmt"."Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCheckpoint_type_projectId_key" ON "application/pmgmt"."ProjectCheckpoint"("type", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEnvironment_type_projectId_key" ON "application/pmgmt"."ProjectEnvironment"("type", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CloudFormationStack_name_key" ON "application/pmgmt"."CloudFormationStack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PulumiStack_name_key" ON "application/pmgmt"."PulumiStack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_candidateId_key" ON "application/recruitment"."CandidateProfile"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationWorkflowPayload_workflowId_key" ON "application/recruitment"."JobApplicationWorkflowPayload"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "application/account"."_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "application/account"."_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "microservice/fmgmt"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "microservice/fmgmt"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/location"."Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "application/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "microservice/order"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "microservice/order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order"."Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "microservice/order"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/order"."StripePaymentIntent" ADD CONSTRAINT "StripePaymentIntent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "microservice/order"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowView" ADD CONSTRAINT "WorkflowView_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "microservice/workflow"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowViewComponent" ADD CONSTRAINT "WorkflowViewComponent_workflowViewId_fkey" FOREIGN KEY ("workflowViewId") REFERENCES "microservice/workflow"."WorkflowView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowState" ADD CONSTRAINT "WorkflowState_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "microservice/workflow"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microservice/workflow"."WorkflowRoute" ADD CONSTRAINT "WorkflowRoute_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "microservice/workflow"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/account"."Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "application/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/account"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "application/account"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/account"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "application/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "application/pmgmt"."ProjectElement" ADD CONSTRAINT "ProjectElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "application/pmgmt"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/pmgmt"."ProjectCheckpoint" ADD CONSTRAINT "ProjectCheckpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "application/pmgmt"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/pmgmt"."ProjectEnvironment" ADD CONSTRAINT "ProjectEnvironment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "application/pmgmt"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/pmgmt"."CloudFormationStack" ADD CONSTRAINT "CloudFormationStack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "application/pmgmt"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/pmgmt"."PulumiStack" ADD CONSTRAINT "PulumiStack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "application/pmgmt"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateProfile" ADD CONSTRAINT "CandidateProfile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateCertification" ADD CONSTRAINT "CandidateCertification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."CandidateTraining" ADD CONSTRAINT "CandidateTraining_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "application/recruitment"."Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflow" ADD CONSTRAINT "JobApplicationWorkflow_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "application/recruitment"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflow" ADD CONSTRAINT "JobApplicationWorkflow_beingHeldByUserId_fkey" FOREIGN KEY ("beingHeldByUserId") REFERENCES "application/account"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowStep" ADD CONSTRAINT "JobApplicationWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowPayload" ADD CONSTRAINT "JobApplicationWorkflowPayload_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowFile" ADD CONSTRAINT "JobApplicationWorkflowFile_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowNote" ADD CONSTRAINT "JobApplicationWorkflowNote_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/recruitment"."JobApplicationWorkflowTask" ADD CONSTRAINT "JobApplicationWorkflowTask_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/recruitment"."JobApplicationWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/tc-request"."TcWorkflowTrail" ADD CONSTRAINT "TcWorkflowTrail_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "application/tc-request"."TcWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/account"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "application/account"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application/account"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "application/account"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
