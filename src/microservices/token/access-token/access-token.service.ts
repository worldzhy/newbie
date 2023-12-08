import {Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as express from 'express';

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Buffer | object, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  decodeToken(token: string): string | {[key: string]: any} | null {
    return this.jwtService.decode(token);
  }

  verifyToken(token: string): string | {[key: string]: any} | null {
    return this.jwtService.verify(token);
  }

  getTokenFromHttpRequest(request: Request | express.Request): string {
    return request.headers['authorization'].split(' ')[1];
  }
}
