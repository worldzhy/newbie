import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {Request} from 'express';
import {AccessTokenService} from '@microservices/account/security/token/access-token.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly accessTokenService: AccessTokenService
  ) {
    const secret = config.getOrThrow<string>(
      'microservice.token.userAccess.secret'
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true, // Pass request via the first parameter of validate
      secretOrKey: secret,
    });
  }

  /**
   * 'vaidate' function will be called after the token in the http request passes the verification.
   *
   * For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
   * Then it invokes our validate() method passing the decoded JSON as its single parameter
   */
  async validate(
    req: Request,
    payload: {userId: string; sub: string; iat: number; exp: number}
  ) {
    const accessToken = this.accessTokenService.getTokenFromHttpRequest(req);
    const count = await this.prisma.accessToken.count({
      where: {token: accessToken},
    });

    if (count > 0) {
      return true;
    } else {
      return false;
    }
  }
}
