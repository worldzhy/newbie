import {Injectable} from '@nestjs/common';
import {Prisma, UserProfile} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.UserProfileFindUniqueOrThrowArgs
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.UserProfileFindManyArgs
  ): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.UserProfileFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.UserProfile,
      params,
      pagination
    );
  }

  async create(params: Prisma.UserProfileCreateArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.create(params);
  }

  async update(params: Prisma.UserProfileUpdateArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.update(params);
  }

  async delete(params: Prisma.UserProfileDeleteArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.delete(params);
  }

  /* End */
}
