import {
  DatapipeStatus,
  ElasticsearchDatasource,
  PostgresqlDatasource,
  Prisma,
  ProjectEnvironmentType,
  ProjectStatus,
} from '@prisma/client';
import {PrismaService} from '../src/_prisma/_prisma.service';
import {AccountService} from '../src/app/account/account.service';
import {AccountController} from '../src/app/account/account.controller';
import {ProjectService} from '../src/app/pmgmt/project/project.service';
import {RoleService} from '../src/app/account/role/role.service';
import {PostgresqlDatasourceService} from '../src/app/ngind/datasource/postgresql/postgresql-datasource.service';
import {ElasticsearchDatasourceService} from '../src/app/ngind/datasource/elasticsearch/elasticsearch-datasource.service';
import {DatapipeController} from '../src/app/ngind/datapipe/datapipe.controller';

const prisma = new PrismaService();

// Account
const accountService = new AccountService();
const auth = new AccountController(accountService);
const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
  },
];

// Role
const roleService = new RoleService(prisma);
const roles: Prisma.RoleCreateInput[] = [
  {
    name: 'admin',
  },
  {
    name: 'user',
  },
];

// Project
const projectService = new ProjectService();
const projects: Prisma.ProjectCreateInput[] = [
  {
    name: 'Galaxy',
    status: ProjectStatus.IN_DEVELOPMENT,
    environments: {
      createMany: {
        skipDuplicates: true,
        data: [
          {
            type: ProjectEnvironmentType.DEVELOPMENT,
            awsAccountId: '077767357755',
            awsProfile: 'Galaxy',
            awsAccessKeyId: 'fakeAKIAREGsfXsf4FY',
            awsSecretAccessKey: 'fakeGVxCF0AEbjdsftVsfswRR8V+uhQg8QJiZxMy',
            awsRegion: 'cn-northwest-1',
          },
          {
            type: ProjectEnvironmentType.STAGING,
            awsAccountId: '077767357755',
            awsProfile: 'Galaxy',
            awsAccessKeyId: 'fakeAKIAREGsfWUsfYEB4FY',
            awsSecretAccessKey: 'fakeGVxCF0AEbj/xisfSsfwRR8V+uhQg8QJiZxMy',
            awsRegion: 'cn-northwest-1',
          },
          {
            type: ProjectEnvironmentType.PRODUCTION,
            awsAccountId: '077767357755',
            awsProfile: 'Galaxy',
            awsAccessKeyId: 'fakeAKsffsdWU5RXYEB4FY',
            awsSecretAccessKey: 'fakeGVxCsfEbj/xi3asfvVswRR8V+uhQg8QJiZxMy',
            awsRegion: 'cn-northwest-1',
          },
        ],
      },
    },
  },
  {
    name: 'InceptionPad',
    status: ProjectStatus.IN_DEVELOPMENT,
    environments: {
      createMany: {
        skipDuplicates: true,
        data: [
          {
            type: ProjectEnvironmentType.DEVELOPMENT,
            awsAccountId: '067174804713',
            awsProfile: 'InceptionPad',
            awsAccessKeyId: 'fakeAKIAQ734OFTUTLIKUV7D',
            awsSecretAccessKey: 'fake7Nw/oOD34gsfoDBkec43s6B2ktqJj2MutiHyfwBUZ',
            awsRegion: 'us-east-1',
          },
          {
            type: ProjectEnvironmentType.STAGING,
            awsAccountId: '067174804713',
            awsProfile: 'InceptionPad',
            awsAccessKeyId: 'fake434Q34OFsdfTLIKUV7D',
            awsSecretAccessKey: 'fake7Nw/oOD34h345oafkecs6B2ktqJj2MsayfwBUZ',
            awsRegion: 'us-east-1',
          },
          {
            type: ProjectEnvironmentType.PRODUCTION,
            awsAccountId: '067174804713',
            awsProfile: 'InceptionPad',
            awsAccessKeyId: 'fakeAKIAQ7IsOF23TLIKUV7D',
            awsSecretAccessKey: 'fake7Nw/oODZ34Igf5oDsfcs6B2342MutiHyfwBUZ',
            awsRegion: 'us-east-1',
          },
        ],
      },
    },
  },
];

// Postgresql datasource
const postgresqlDatasourceService = new PostgresqlDatasourceService();
const postgresql = {
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  schema: 'public',
};

// Elasticsearch datasource
const elasticsearchDatasourceService = new ElasticsearchDatasourceService();
const elasticsearch = {node: '127.0.0.1'};

//  Datapipe
const datapipeController = new DatapipeController();
const datapipe = {
  name: 'pg2es_datapipe',
  status: DatapipeStatus.INACTIVE,
  queueUrl:
    'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
  hasManyTables: [],
  belongsToTables: [],
  fromTableId: 1,
  toIndexId: 1,
};

async function main() {
  console.log('start seeding ...');

  console.log('- users');
  for (const user of users) {
    await auth.signup(user);
  }

  console.log('- roles');
  for (const role of roles) {
    await roleService.create(role);
  }

  console.log('- projects');
  for (const project of projects) {
    await projectService.create(project);
  }

  console.log('- datasources');
  let datasource: PostgresqlDatasource | ElasticsearchDatasource;
  datasource = await postgresqlDatasourceService.create(postgresql);
  await postgresqlDatasourceService.mount(datasource);
  datasource = await elasticsearchDatasourceService.create(elasticsearch);
  await elasticsearchDatasourceService.mount(datasource);

  console.log('- datapipes');
  await datapipeController.createDatapipe(datapipe);

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
