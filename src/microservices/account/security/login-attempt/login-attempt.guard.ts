import {Injectable, ExecutionContext, CanActivate} from '@nestjs/common';
import {SecurityLoginIpAttemptService} from './login-attempt.service';

@Injectable()
export class SecurityLoginIpAttemptGuard implements CanActivate {
  constructor(
    private securityLoginIpAttemptService: SecurityLoginIpAttemptService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ipAddress = context.switchToHttp().getRequest().socket.remoteAddress;
    return await this.securityLoginIpAttemptService.isAllowed(ipAddress);
  }
}
