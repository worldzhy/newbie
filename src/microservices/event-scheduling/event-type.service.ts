import {Injectable} from '@nestjs/common';
import {EventType} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class EventTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async match(name: string): Promise<EventType> {
    // [step 1] Get matched event type.
    const eventTypes = await this.prisma.eventType.findMany();
    for (let i = 0; i < eventTypes.length; i++) {
      const eventType = eventTypes[i];
      if (
        name.toLowerCase().includes(eventType.name.toLowerCase()) ||
        eventType.name.toLowerCase().includes(name.toLowerCase())
      ) {
        return eventType;
      }
    }

    // [step 2] Create Not Found event type.
    return await this.prisma.eventType.create({
      data: {name, minutesOfDuration: 0},
    });
  }

  /* End */
}
