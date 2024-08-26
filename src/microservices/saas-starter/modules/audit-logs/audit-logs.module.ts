import {Module} from '@nestjs/common';

import {AuditLogController} from './audit-logs.controller';
import {AuditLogGroupController} from './audit-logs-group.controller';
import {AuditLogUserController} from './audit-logs-user.controller';
import {AuditLogsService} from './audit-logs.service';

@Module({
  controllers: [
    AuditLogController,
    AuditLogGroupController,
    AuditLogUserController,
  ],
  providers: [AuditLogsService],
})
export class AuditLogsModule {}
