import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {getJwtConfig} from './token.config';
import * as express from 'express';
import {convertUnixToDate} from '../utilities/date.util';

@Injectable()
class TokenService extends JwtService {
  constructor(config: {
    secret: string | undefined;
    signOptions: {expiresIn: string | undefined};
  }) {
    super(config);
  }

  decodeToken(token: string): string | {[key: string]: any} | null {
    return this.decode(token);
  }

  verifyToken(token: string): string | {[key: string]: any} | null {
    return this.verify(token);
  }
}

export class AccessTokenService extends TokenService {
  constructor() {
    const jwtConfig = getJwtConfig().accessToken;
    const config = {
      secret: jwtConfig.secret,
      signOptions: {expiresIn: jwtConfig.expiresIn},
    };
    super(config);
  }

  getTokenFromHttpRequest(request: Request | express.Request): string {
    return request.headers['authorization'].split(' ')[1];
  }
}

export class RefreshTokenService extends TokenService {
  public cookieName = 'refreshToken';

  constructor() {
    const jwtConfig = getJwtConfig().refreshToken;
    const config = {
      secret: jwtConfig.secret,
      signOptions: {expiresIn: jwtConfig.expiresIn},
    };
    super(config);
  }

  getCookieConfig(refreshToken?: string): express.CookieOptions {
    const baseConfig: express.CookieOptions = {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/account/refresh',
    };

    if (refreshToken) {
      const data = this.decode(refreshToken) as {
        exp: number; // Expiry is expressed in unix timestamp
      };
      return {
        expires: convertUnixToDate(data.exp),
        ...baseConfig,
      };
    } else {
      return baseConfig;
    }
  }
}
