import {Prisma} from '@prisma/client';
import {PrismaService} from '../src/_prisma/_prisma.service';
import {AccountService} from '../src/app/_account/_account.service';
import {AccountController} from '../src/app/_account/_account.controller';
import {RoleService} from '../src/app/_role/_role.service';

const prisma = new PrismaService();
// user
const accountService = new AccountService();
const auth = new AccountController(accountService);
// role
const roleService = new RoleService(prisma);

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

async function main() {
  console.log('start seeding ...');
  for (const user of users) {
    await auth.signup(user);
  }

  for (const role of roles) {
    await roleService.createRole(role);
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
