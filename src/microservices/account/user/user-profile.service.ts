import {Injectable} from '@nestjs/common';
import {Prisma, UserProfile} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.UserProfileFindUniqueOrThrowArgs
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.UserProfileFindManyArgs): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.UserProfileFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.UserProfile,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.UserProfileCreateArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.create(args);
  }

  async update(args: Prisma.UserProfileUpdateArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.update(args);
  }

  async delete(args: Prisma.UserProfileDeleteArgs): Promise<UserProfile> {
    return await this.prisma.userProfile.delete(args);
  }

  /* End */
}
