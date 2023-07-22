import {Injectable} from '@nestjs/common';
import {Prisma, UserToken} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class UserTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirstOrThrow(
    params: Prisma.UserTokenFindFirstOrThrowArgs
  ): Promise<UserToken> {
    return await this.prisma.userToken.findFirstOrThrow(params);
  }

  async findUnique(
    params: Prisma.UserTokenFindUniqueArgs
  ): Promise<UserToken | null> {
    return await this.prisma.userToken.findUnique(params);
  }

  async findMany(params: Prisma.UserTokenFindManyArgs): Promise<UserToken[]> {
    return await this.prisma.userToken.findMany(params);
  }

  async create(params: Prisma.UserTokenCreateArgs): Promise<UserToken> {
    return await this.prisma.userToken.create(params);
  }

  async update(params: Prisma.UserTokenUpdateArgs): Promise<UserToken> {
    return await this.prisma.userToken.update(params);
  }

  async updateMany(
    params: Prisma.UserTokenUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.userToken.updateMany(params);
  }

  async delete(params: Prisma.UserTokenDeleteArgs): Promise<UserToken> {
    return await this.prisma.userToken.delete(params);
  }

  /* End */
}
