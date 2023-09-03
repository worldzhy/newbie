import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AuthProfileGuard extends AuthGuard(
  'passport-custom.user-profile'
) {}
