import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class NoAuthGuard extends AuthGuard('custom.no-auth') {}
