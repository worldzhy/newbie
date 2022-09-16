import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AuthPasswordGuard extends AuthGuard('passport-local.password') {}
