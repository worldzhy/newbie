import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
   * It then invokes our validate() method passing the decoded JSON as its single parameter
   *
   * @param {*} payload
   * @returns
   * @memberof JwtStrategy
   */
  async validate(payload: any) {
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
