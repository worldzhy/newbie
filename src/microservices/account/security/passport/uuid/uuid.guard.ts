import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class UuidAuthGuard extends AuthGuard('custom.uuid') {}
