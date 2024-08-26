import {SetMetadata} from '@nestjs/common';
import {AUDIT_LOG_DATA} from './audit-log.constants';

export const AuditLog = (...value: string[]) =>
  SetMetadata(AUDIT_LOG_DATA, value);
