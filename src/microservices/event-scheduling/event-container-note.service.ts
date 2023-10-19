import {Injectable} from '@nestjs/common';
import {Prisma, EventContainerNote} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventContainerNoteService {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    args: Prisma.EventContainerNoteFindFirstArgs
  ): Promise<EventContainerNote | null> {
    return await this.prisma.eventContainerNote.findFirst(args);
  }

  async findUniqueOrThrow(
    args: Prisma.EventContainerNoteFindUniqueOrThrowArgs
  ): Promise<EventContainerNote> {
    return await this.prisma.eventContainerNote.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventContainerNoteFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventContainerNote,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.EventContainerNoteCreateArgs
  ): Promise<EventContainerNote> {
    return await this.prisma.eventContainerNote.create(args);
  }

  async createMany(
    args: Prisma.EventContainerNoteCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainerNote.createMany(args);
  }

  async update(
    args: Prisma.EventContainerNoteUpdateArgs
  ): Promise<EventContainerNote> {
    return await this.prisma.eventContainerNote.update(args);
  }

  async updateMany(
    args: Prisma.EventContainerNoteUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventContainerNote.updateMany(args);
  }

  async delete(
    args: Prisma.EventContainerNoteDeleteArgs
  ): Promise<EventContainerNote> {
    return await this.prisma.eventContainerNote.delete(args);
  }

  async count(args: Prisma.EventContainerNoteCountArgs): Promise<number> {
    return await this.prisma.eventContainerNote.count(args);
  }

  /* End */
}
