import {Injectable} from '@nestjs/common';
import {Prisma, UserProfile} from '@prisma/client';
import {PrismaService} from '../../../tools/prisma/prisma.service';

@Injectable()
export class UserProfileService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.UserProfileFindUniqueArgs
  ): Promise<UserProfile | null> {
    return await this.prisma.userProfile.findUnique(params);
  }

  async findMany(
    params: Prisma.UserProfileFindManyArgs
  ): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany(params);
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
