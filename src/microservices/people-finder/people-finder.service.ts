import {Injectable} from '@nestjs/common';
import {VoilaNorbertService} from './voila-norbert/volia-norbert.service';
import {ProxycurlService} from './proxycurl/proxycurl.service';
import {PeopledatalabsService} from './peopledatalabs/peopledatalabs.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {PeopleFinderStatus, PeopleFinderPlatforms} from './constants';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  constructor(
    public readonly voilaNorbert: VoilaNorbertService,
    public readonly proxycurl: ProxycurlService,
    public readonly peopledatalabs: PeopledatalabsService,
    private readonly prisma: PrismaService
  ) {}

  async isExist({
    platform,
    userSource,
    userId,
  }: {
    platform: PeopleFinderPlatforms;
    userSource: string;
    userId: string;
  }): Promise<boolean> {
    const res = await this.prisma.contactSearch.findFirst({
      where: {
        status: {not: PeopleFinderStatus.deleted},
        source: platform,
        userSource,
        userId,
      },
    });
    if (res) return true;
    return false;
  }
}
