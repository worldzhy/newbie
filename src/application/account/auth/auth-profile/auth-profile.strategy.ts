import {Strategy} from 'passport-custom';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthProfileService} from './auth-profile.service';
import {Request} from 'express';

@Injectable()
export class AuthProfileStrategy extends PassportStrategy(
  Strategy,
  'custom.profile'
) {
  constructor(private authProfileService: AuthProfileService) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   *
   * @param {Request} req
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AuthProfileStrategy
   */
  async validate(
    req: Request
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.authProfileService.validateByProfile(req.body);
    if (result.data && !result.err) {
      return result;
    } else {
      throw new UnauthorizedException(result);
    }
  }
}
