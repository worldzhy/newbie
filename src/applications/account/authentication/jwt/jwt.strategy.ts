import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {getJwtConfig} from '../../../../toolkits/token/token.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'passport-jwt') {
  constructor() {
    const jwtConfig = getJwtConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * 'vaidate' function must be implemented.
   *
   * For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
   * Then it invokes our validate() method passing the decoded JSON as its single parameter
   */
  async validate(payload: {
    userId: string;
    sub: string;
  }): Promise<{userId: string; username: string}> {
    /* payload sample
    {
      userId: 'cee65873-f194-4a35-bd5b-21aea534704c',
      sub: 'worldzhy@126.com',
      iat: 1650467776,
      exp: 1650473776
    }
    */
    return {userId: payload.userId, username: payload.sub};
  }
}
