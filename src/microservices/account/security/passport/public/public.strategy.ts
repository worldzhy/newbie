import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';

@Injectable()
export class NoAuthStrategy extends PassportStrategy(
  Strategy,
  'custom.no-auth'
) {
  constructor() {
    super();
  }

  async validate(): Promise<boolean> {
    return true;
  }
}
