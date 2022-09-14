import {Injectable} from '@nestjs/common';
import {Prisma, Profile} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class ProfileService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.ProfileFindUniqueArgs
  ): Promise<Profile | null> {
    return await this.prisma.profile.findUnique(params);
  }

  async findMany(params: Prisma.ProfileFindManyArgs): Promise<Profile[]> {
    return await this.prisma.profile.findMany(params);
  }

  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return await this.prisma.profile.create({
      data: data,
    });
  }

  async update(params: Prisma.ProfileUpdateArgs): Promise<Profile> {
    return await this.prisma.profile.update(params);
  }

  /* End */
}
