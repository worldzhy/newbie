import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AuthUuidGuard extends AuthGuard('passport-custom.uuid') {}
