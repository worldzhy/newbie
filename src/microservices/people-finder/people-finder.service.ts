import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {PeopleFinderStatus, PeopleFinderPlatforms} from './constants';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  constructor(private readonly prisma: PrismaService) {}

  async isExist({
    platform,
    userSource,
    userId,
  }: {
    platform: PeopleFinderPlatforms;
    userSource: string;
    userId: string;
  }): Promise<number> {
    const res = await this.prisma.contactSearch.findFirst({
      where: {
        status: {
          notIn: [
            PeopleFinderStatus.deleted,
            PeopleFinderStatus.parameterError,
          ],
        },
        source: platform,
        userSource,
        userId,
      },
    });
    if (res) return res.id;
    return 0;
  }
}
