import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Processor, Process} from '@nestjs/bull';
import {Job} from 'bull';
import {PeopleFinderService} from './people-finder.service';
import {PeopleFinderPlatforms, PeopleFinderBullJob} from './constants';

export const PeopleFinderQueue = 'people-finder';

@Processor(PeopleFinderQueue)
@Injectable()
export class PeopleFinderJobProcessor {
  callBackOrigin: string;
  constructor(
    private readonly configService: ConfigService,
    private peopleFinder: PeopleFinderService
  ) {
    this.callBackOrigin = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.voilanorbert.callbackOrigin'
    );
  }

  @Process({concurrency: 1})
  async peopleFinderProcess(job: Job) {
    const {data}: {data: PeopleFinderBullJob} = job;
    if (data) {
      let isGetEmail = false;
      const {...user} = data;
      if (user.findPhone) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExist = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.peopledatalabs,
          userId: user.userId,
          userSource: user.userSource,
        });
        if (isExist) return {};

        const findRes = await this.peopleFinder.peopledatalabsFind(
          'byDomain',
          user,
          {
            phone: true,
            email: false,
          }
        );
        if (findRes?.dataFlag.email) isGetEmail = findRes.dataFlag.email;
      }
      if (user.findEmail && !isGetEmail) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExist = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.voilanorbert,
          userId: user.userId,
          userSource: user.userSource,
        });
        if (isExist) return {};

        const findRes = await this.peopleFinder.voilanorbertFind(
          user,
          this.callBackOrigin + '/people-finder/voilanorbert-hook?id='
        );
        // searching completed && no email
        if (findRes?.res?.searching === false && !findRes?.dataFlag.email) {
          // Check if the current personnel have records on the current platform, and do not execute those with records
          const isExist = await this.peopleFinder.isExist({
            platform: PeopleFinderPlatforms.proxycurl,
            userId: user.userId,
            userSource: user.userSource,
          });
          if (isExist) return {};

          await this.peopleFinder.proxycurlFind(user, {
            phone: true,
            email: true,
          });
        }
      }
    }

    return {};
  }
}
