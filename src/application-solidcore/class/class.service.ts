import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async merge(fromEventTypeId: number, toEventTypeId: number) {
    // [step 1] Get class types.
    const fromEventType = await this.prisma.eventType.findUniqueOrThrow({
      where: {id: fromEventTypeId},
    });
    const toEventType = await this.prisma.eventType.findUniqueOrThrow({
      where: {id: toEventTypeId},
    });

    // [step 2] Change class type id for classes.
    const result = await this.prisma.event.updateMany({
      where: {typeId: fromEventType.id},
      data: {typeId: toEventTypeId},
    });

    // [step 3] Update toEventType aliases
    if (!toEventType.aliases.includes(fromEventType.name)) {
      toEventType.aliases.push(fromEventType.name);
      await this.prisma.eventType.update({
        where: {id: toEventType.id},
        data: {aliases: toEventType.aliases},
      });
    }

    // [step 4] Remove fromEventType
    await this.prisma.eventType.delete({where: {id: fromEventType.id}});

    return result.count;
  }

  /* End */
}
