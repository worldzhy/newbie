import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AuthVerificationCodeGuard extends AuthGuard(
  'local.verification-code'
) {}
