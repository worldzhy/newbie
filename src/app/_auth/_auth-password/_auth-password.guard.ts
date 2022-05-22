import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AuthPasswordGuard extends AuthGuard('local.password') {}
