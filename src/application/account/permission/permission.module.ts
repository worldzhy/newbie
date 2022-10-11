import {Module} from '@nestjs/common';
import {PermissionController} from './permission.controller';
import {PermissionService} from './permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
