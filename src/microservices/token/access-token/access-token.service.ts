import {Injectable} from '@nestjs/common';
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import {Prisma, AccessToken} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import * as express from 'express';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  sign(payload: string | Buffer | object, options?: JwtSignOptions): string {
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

  async findFirstOrThrow(
    params: Prisma.AccessTokenFindFirstOrThrowArgs
  ): Promise<AccessToken> {
    return await this.prisma.accessToken.findFirstOrThrow(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AccessTokenFindUniqueOrThrowArgs
  ): Promise<AccessToken> {
    return await this.prisma.accessToken.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AccessTokenFindManyArgs
  ): Promise<AccessToken[]> {
    return await this.prisma.accessToken.findMany(params);
  }

  async create(params: Prisma.AccessTokenCreateArgs): Promise<AccessToken> {
    return await this.prisma.accessToken.create(params);
  }

  async update(params: Prisma.AccessTokenUpdateArgs): Promise<AccessToken> {
    return await this.prisma.accessToken.update(params);
  }

  async updateMany(
    params: Prisma.AccessTokenUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.accessToken.updateMany(params);
  }

  async delete(params: Prisma.AccessTokenDeleteArgs): Promise<AccessToken> {
    return await this.prisma.accessToken.delete(params);
  }

  async deleteMany(
    params: Prisma.AccessTokenDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.accessToken.deleteMany(params);
  }
}
