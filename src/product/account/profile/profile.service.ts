import {Injectable} from '@nestjs/common';
import {Prisma, Profile} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class ProfileService {
  private prisma = new PrismaService();

  async findOne(
    profileWhereUniqueInput: Prisma.ProfileWhereUniqueInput
  ): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where: profileWhereUniqueInput,
    });
  }

  async findMany(whereInput: Prisma.ProfileWhereInput): Promise<Profile[]> {
    return await this.prisma.profile.findMany({
      where: whereInput,
    });
  }

  async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return await this.prisma.profile.create({
      data: data,
    });
  }

  async update(params: {
    where: Prisma.ProfileWhereUniqueInput;
    data: Prisma.ProfileUpdateInput;
  }): Promise<Profile> {
    const {where, data} = params;
    return await this.prisma.profile.update({
      where,
      data,
    });
  }

  /* End */
}
