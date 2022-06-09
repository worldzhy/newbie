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
            awsRegion: 'cn-northwest-1',
          },
          {type: ProjectEnvironmentType.STAGING, awsRegion: 'cn-northwest-1'},
          {
            type: ProjectEnvironmentType.PRODUCTION,
            awsProfile: 'Galaxy',
            awsRegion: 'cn-northwest-1',
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
