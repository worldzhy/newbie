import {Injectable, ExecutionContext, CanActivate} from '@nestjs/common';
import {IpLoginAttemptService} from './login-attempt.service';

@Injectable()
export class SecurityIpLoginAttemptGuard implements CanActivate {
  constructor(private ipLoginAttemptService: IpLoginAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ipAddress = context.switchToHttp().getRequest().socket.remoteAddress;
    return await this.ipLoginAttemptService.isAllowed(ipAddress);
  }
}
