import {Injectable} from '@nestjs/common';
import {Prisma, AccessToken} from '@prisma/client';
import {PrismaService} from '../../../../toolkit/prisma/prisma.service';

@Injectable()
export class UserAccessTokenService {
  private prisma = new PrismaService();

  async findFirstOrThrow(
    params: Prisma.AccessTokenFindFirstOrThrowArgs
  ): Promise<AccessToken> {
    return await this.prisma.accessToken.findFirstOrThrow(params);
  }

  async findUnique(
    params: Prisma.AccessTokenFindUniqueArgs
  ): Promise<AccessToken | null> {
    return await this.prisma.accessToken.findUnique(params);
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

  /* End */
}
