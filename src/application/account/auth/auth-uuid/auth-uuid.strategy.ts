import {Strategy} from 'passport-custom';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthUuidService} from './auth-uuid.service';
import {Request} from 'express';

@Injectable()
export class AuthUuidStrategy extends PassportStrategy(
  Strategy,
  'custom.uuid'
) {
  constructor(private authUuidService: AuthUuidService) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   *
   * @param {Request} req
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AuthUuidStrategy
   */
  async validate(
    req: Request
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.authUuidService.validateByUuid(req.body.uuid);
    if (result.data && !result.err) {
      return result;
    } else {
      throw new UnauthorizedException(result);
    }
  }
}
