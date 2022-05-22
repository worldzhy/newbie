import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {RoleService} from './_role.service';
import {RoleController} from './_role.controller';
import {RolesGuard} from './_roles.guard';
import {PrismaModule} from '../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    RoleService,
    {
      // Register the RolesGuard as a global guard using the following construction (in any module)
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
