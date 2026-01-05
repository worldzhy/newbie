import 'dotenv/config';
import {defineConfig, env} from 'prisma/config';

export default defineConfig({
  schema: 'prisma/',
  datasource: {
    url: env('PRISMA_DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -r tsconfig-paths/register ./prisma/seed.ts',
  },
});
