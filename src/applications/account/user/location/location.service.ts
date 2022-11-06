import {Injectable} from '@nestjs/common';
import {Prisma, UserLocation} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class UserLocationService {
  private prisma = new PrismaService();

  async findUnique(
    params: Prisma.UserLocationFindUniqueArgs
  ): Promise<UserLocation | null> {
    return await this.prisma.userLocation.findUnique(params);
  }

  async findMany(
    params: Prisma.UserLocationFindManyArgs
  ): Promise<UserLocation[]> {
    return await this.prisma.userLocation.findMany(params);
  }

  async create(params: Prisma.UserLocationCreateArgs): Promise<UserLocation> {
    return await this.prisma.userLocation.create(params);
  }

  async update(params: Prisma.UserLocationUpdateArgs): Promise<UserLocation> {
    return await this.prisma.userLocation.update(params);
  }

  async delete(params: Prisma.UserLocationDeleteArgs): Promise<UserLocation> {
    return await this.prisma.userLocation.delete(params);
  }

  /* End */
}
