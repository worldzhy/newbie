import {Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as express from 'express';
import {convertUnixToDate} from 'src/toolkit/utilities/date.util';

@Injectable()
export class RefreshTokenService {
  public cookieName = 'refreshToken';

  constructor(private readonly jwtService: JwtService) {}

  sign(payload: string | Buffer | object, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  decodeToken(token: string): string | {[key: string]: any} | null {
    return this.jwtService.decode(token);
  }

  verifyToken(token: string): string | {[key: string]: any} | null {
    return this.jwtService.verify(token);
  }

  getCookieConfig(refreshToken?: string): express.CookieOptions {
    const baseConfig: express.CookieOptions = {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/account/refresh',
    };

    if (refreshToken) {
      const data = this.jwtService.decode(refreshToken) as {
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
