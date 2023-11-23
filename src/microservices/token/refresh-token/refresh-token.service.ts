import {Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as express from 'express';
import {Prisma, RefreshToken} from '@prisma/client';
import {convertUnixToDate} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  public cookieName = 'refreshToken';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  sign(payload: Buffer | object, options?: JwtSignOptions): string {
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

  async findFirstOrThrow(
    params: Prisma.RefreshTokenFindFirstOrThrowArgs
  ): Promise<RefreshToken> {
    return await this.prisma.refreshToken.findFirstOrThrow(params);
  }

  async findUniqueOrThrow(
    params: Prisma.RefreshTokenFindUniqueOrThrowArgs
  ): Promise<RefreshToken> {
    return await this.prisma.refreshToken.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.RefreshTokenFindManyArgs
  ): Promise<RefreshToken[]> {
    return await this.prisma.refreshToken.findMany(params);
  }

  async create(params: Prisma.RefreshTokenCreateArgs): Promise<RefreshToken> {
    return await this.prisma.refreshToken.create(params);
  }

  async update(params: Prisma.RefreshTokenUpdateArgs): Promise<RefreshToken> {
    return await this.prisma.refreshToken.update(params);
  }

  async updateMany(
    params: Prisma.RefreshTokenUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.refreshToken.updateMany(params);
  }

  async delete(params: Prisma.RefreshTokenDeleteArgs): Promise<RefreshToken> {
    return await this.prisma.refreshToken.delete(params);
  }

  async deleteMany(
    params: Prisma.RefreshTokenDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.refreshToken.deleteMany(params);
  }
}
