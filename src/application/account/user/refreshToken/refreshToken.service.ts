import {Injectable} from '@nestjs/common';
import {Prisma, RefreshToken} from '@prisma/client';
import {PrismaService} from '../../../../toolkit/prisma/prisma.service';

@Injectable()
export class UserRefreshTokenService {
  private prisma = new PrismaService();

  async findFirstOrThrow(
    params: Prisma.RefreshTokenFindFirstOrThrowArgs
  ): Promise<RefreshToken> {
    return await this.prisma.refreshToken.findFirstOrThrow(params);
  }

  async findUnique(
    params: Prisma.RefreshTokenFindUniqueArgs
  ): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique(params);
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

  /* End */
}
