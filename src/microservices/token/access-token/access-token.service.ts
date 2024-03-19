import {BadRequestException, Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as express from 'express';

@Injectable()
export class AccessTokenService {
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

  getTokenFromHttpRequest(request: express.Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  getUserIdFromHttpRequest(request: express.Request) {
    const accessToken = this.getTokenFromHttpRequest(request);
    if (accessToken === undefined) {
      throw new BadRequestException('No access token.');
    }
    const {userId} = this.decodeToken(accessToken) as {
      userId: string;
    };

    return userId;
  }
}
