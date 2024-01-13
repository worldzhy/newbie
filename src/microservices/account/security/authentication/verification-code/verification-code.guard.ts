import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class VerificationCodeAuthGuard extends AuthGuard(
  'passport-local.verification-code'
) {}
