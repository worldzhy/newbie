import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class ProfileAuthGuard extends AuthGuard(
  'passport-custom.user-profile'
) {}
