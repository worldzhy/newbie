import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard('custom.refresh-token') {}
