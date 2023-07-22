import {Injectable} from '@nestjs/common';
import {Prisma, Task} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.TaskFindUniqueArgs): Promise<Task | null> {
    return await this.prisma.task.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.TaskFindUniqueOrThrowArgs
  ): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.TaskFindManyArgs): Promise<Task[]> {
    return await this.prisma.task.findMany(params);
  }

  async create(params: Prisma.TaskCreateArgs): Promise<Task> {
    return await this.prisma.task.create(params);
  }

  async createMany(
    params: Prisma.TaskCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.createMany(params);
  }

  async update(params: Prisma.TaskUpdateArgs): Promise<Task> {
    return await this.prisma.task.update(params);
  }

  async updateMany(
    params: Prisma.TaskUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.updateMany(params);
  }

  async delete(params: Prisma.TaskDeleteArgs): Promise<Task> {
    return await this.prisma.task.delete(params);
  }

  /* End */
}
