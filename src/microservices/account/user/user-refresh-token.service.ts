import {Injectable} from '@nestjs/common';
import {Prisma, UserRefreshToken} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class UserRefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirstOrThrow(
    params: Prisma.UserRefreshTokenFindFirstOrThrowArgs
  ): Promise<UserRefreshToken> {
    return await this.prisma.userRefreshToken.findFirstOrThrow(params);
  }

  async findUnique(
    params: Prisma.UserRefreshTokenFindUniqueArgs
  ): Promise<UserRefreshToken | null> {
    return await this.prisma.userRefreshToken.findUnique(params);
  }

  async findMany(
    params: Prisma.UserRefreshTokenFindManyArgs
  ): Promise<UserRefreshToken[]> {
    return await this.prisma.userRefreshToken.findMany(params);
  }

  async create(
    params: Prisma.UserRefreshTokenCreateArgs
  ): Promise<UserRefreshToken> {
    return await this.prisma.userRefreshToken.create(params);
  }

  async update(
    params: Prisma.UserRefreshTokenUpdateArgs
  ): Promise<UserRefreshToken> {
    return await this.prisma.userRefreshToken.update(params);
  }

  async updateMany(
    params: Prisma.UserRefreshTokenUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.userRefreshToken.updateMany(params);
  }

  async delete(
    params: Prisma.UserRefreshTokenDeleteArgs
  ): Promise<UserRefreshToken> {
    return await this.prisma.userRefreshToken.delete(params);
  }

  async deleteMany(
    params: Prisma.UserRefreshTokenDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.userRefreshToken.deleteMany(params);
  }

  /* End */
}
