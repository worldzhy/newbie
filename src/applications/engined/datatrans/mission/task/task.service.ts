import {Injectable} from '@nestjs/common';
import {Prisma, DatatransTask} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class DatatransTaskService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.DatatransTaskFindUniqueArgs
  ): Promise<DatatransTask | null> {
    return await this.prisma.datatransTask.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.DatatransTaskFindUniqueOrThrowArgs
  ): Promise<DatatransTask> {
    return await this.prisma.datatransTask.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.DatatransTaskFindManyArgs
  ): Promise<DatatransTask[]> {
    return await this.prisma.datatransTask.findMany(params);
  }

  async create(params: Prisma.DatatransTaskCreateArgs): Promise<DatatransTask> {
    return await this.prisma.datatransTask.create(params);
  }

  async createMany(
    params: Prisma.DatatransTaskCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.datatransTask.createMany(params);
  }

  async update(params: Prisma.DatatransTaskUpdateArgs): Promise<DatatransTask> {
    return await this.prisma.datatransTask.update(params);
  }

  async delete(params: Prisma.DatatransTaskDeleteArgs): Promise<DatatransTask> {
    return await this.prisma.datatransTask.delete(params);
  }

  /* End */
}
