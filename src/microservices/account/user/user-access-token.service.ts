import {Injectable} from '@nestjs/common';
import {Prisma, UserAccessToken} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class UserAccessTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirstOrThrow(
    params: Prisma.UserAccessTokenFindFirstOrThrowArgs
  ): Promise<UserAccessToken> {
    return await this.prisma.userAccessToken.findFirstOrThrow(params);
  }

  async findUnique(
    params: Prisma.UserAccessTokenFindUniqueArgs
  ): Promise<UserAccessToken | null> {
    return await this.prisma.userAccessToken.findUnique(params);
  }

  async findMany(
    params: Prisma.UserAccessTokenFindManyArgs
  ): Promise<UserAccessToken[]> {
    return await this.prisma.userAccessToken.findMany(params);
  }

  async create(
    params: Prisma.UserAccessTokenCreateArgs
  ): Promise<UserAccessToken> {
    return await this.prisma.userAccessToken.create(params);
  }

  async update(
    params: Prisma.UserAccessTokenUpdateArgs
  ): Promise<UserAccessToken> {
    return await this.prisma.userAccessToken.update(params);
  }

  async updateMany(
    params: Prisma.UserAccessTokenUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.userAccessToken.updateMany(params);
  }

  async delete(
    params: Prisma.UserAccessTokenDeleteArgs
  ): Promise<UserAccessToken> {
    return await this.prisma.userAccessToken.delete(params);
  }

  async deleteMany(
    params: Prisma.UserAccessTokenDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.userAccessToken.deleteMany(params);
  }

  /* End */
}
