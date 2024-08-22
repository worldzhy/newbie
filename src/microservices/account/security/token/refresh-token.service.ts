import {Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as express from 'express';
import {dateOfUnixTimestamp} from '@framework/utilities/datetime.util';

@Injectable()
export class RefreshTokenService {
  public cookieName = 'refreshToken';

  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Buffer | object, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  decodeToken(token: string): string | {[key: string]: any} | null {
    /**
     * return an object including:
     * - iat: 1710845599 (was issued at)
     * - exp: 1710846199 (will expire at)
     */
    return this.jwtService.decode(token);
  }

  verifyToken(token: string): string | {[key: string]: any} | null {
    return this.jwtService.verify(token);
  }

  getCookieOptions(refreshToken?: string): express.CookieOptions {
    const baseOptions: express.CookieOptions = {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    };

    if (refreshToken) {
      const data = this.jwtService.decode(refreshToken) as {
        exp: number; // Expiry is expressed in unix timestamp
      };
      return {
        expires: dateOfUnixTimestamp(data.exp),
        ...baseOptions,
      };
    } else {
      return baseOptions;
    }
  }
}
