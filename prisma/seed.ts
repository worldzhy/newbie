import {Prisma, ProjectEnvironmentType, ProjectStatus} from '@prisma/client';
import {PrismaService} from '../src/_prisma/_prisma.service';
import {AccountService} from '../src/app/account/account.service';
import {AccountController} from '../src/app/account/account.controller';
import {ProjectService} from '../src/app/project/project.service';
import {RoleService} from '../src/app/account/role/role.service';

const prisma = new PrismaService();
// create account controller
const accountService = new AccountService();
const auth = new AccountController(accountService);
// create role service
const roleService = new RoleService(prisma);
// create project service
const projectService = new ProjectService();

const users = [
  {
    username: 'henry',
    password: 'Abc1234!',
  },
];

const roles: Prisma.RoleCreateInput[] = [
  {
    name: 'admin',
  },
  {
    name: 'user',
  },
];

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
            awsProfile: 'Galaxy',
            awsAccessKeyId: 'fakeAKIAREGsfXsf4FY',
            awsSecretAccessKey: 'fakeGVxCF0AEbjdsftVsfswRR8V+uhQg8QJiZxMy',
            awsRegion: 'cn-northwest-1',
          },
          {
            type: ProjectEnvironmentType.STAGING,
            awsProfile: 'Galaxy',
            awsAccessKeyId: 'fakeAKIAREGsfWUsfYEB4FY',
            awsSecretAccessKey: 'fakeGVxCF0AEbj/xisfSsfwRR8V+uhQg8QJiZxMy',
            awsRegion: 'cn-northwest-1',
          },
          {
            type: ProjectEnvironmentType.PRODUCTION,
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
            awsProfile: 'InceptionPad',
            awsAccessKeyId: 'fakeAKIAQ734OFTUTLIKUV7D',
            awsSecretAccessKey: 'fake7Nw/oOD34gsfoDBkec43s6B2ktqJj2MutiHyfwBUZ',
            awsRegion: 'us-east-1',
          },
          {
            type: ProjectEnvironmentType.STAGING,
            awsProfile: 'InceptionPad',
            awsAccessKeyId: 'fake434Q34OFsdfTLIKUV7D',
            awsSecretAccessKey: 'fake7Nw/oOD34h345oafkecs6B2ktqJj2MsayfwBUZ',
            awsRegion: 'us-east-1',
          },
          {
            type: ProjectEnvironmentType.PRODUCTION,
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

async function main() {
  console.log('start seeding ...');
  for (const user of users) {
    await auth.signup(user);
  }

  for (const role of roles) {
    await roleService.createRole(role);
  }

  for (const project of projects) {
    await projectService.create(project);
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  })
  .finally(async () => {});
