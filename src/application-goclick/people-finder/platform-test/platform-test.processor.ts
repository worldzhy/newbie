import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Processor, Process, InjectQueue} from '@nestjs/bull';
import {Job, Queue} from 'bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {PeopleFinderService} from '@microservices/people-finder/people-finder.service';
import {MixRankService} from '@microservices/people-finder/mixrank/mixrank.service';
import {ProxycurlService} from '@microservices/people-finder/proxycurl/proxycurl.service';
import {SnovService} from '@microservices/people-finder/snov/snov.service';

import {
  PeopleFinderTaskBullJob,
  PeopleFinderTaskStatus,
} from '@microservices/people-finder/constants';

export const PeopleFinderTestQueue = 'people-finder-platform-test';
export const PauseTaskBatchIds = 'PAUSE_TASK_BATCH_IDS';

// mixrank | proxycurl | snov
const TestPlatform: 'mixrank' | 'proxycurl' | 'snov' = 'snov';

@Processor(PeopleFinderTestQueue)
@Injectable()
export class PeopleFinderJobProcessor {
  currentPauseTaskBatchIds?: number[];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinder: PeopleFinderService,
    private mixRankService: MixRankService,
    private proxycurlService: ProxycurlService,
    private snovService: SnovService,
    @InjectQueue(PeopleFinderTestQueue) public queue: Queue
  ) {}

  @Process({concurrency: 1})
  async peopleFinderProcess(job: Job) {
    const {data}: {data: PeopleFinderTaskBullJob} = job;

    const {
      id: peopleFinderTaskId,
      taskBatchId,
      linkedin,
      companyDomain,
      name,
      ...user
    } = data;

    let params = {};
    let callThirdPartyId = 0;
    if (TestPlatform === 'mixrank') {
      if (linkedin) {
        params = {linkedin};
        const {callThirdPartyId: _callThirdPartyId} =
          await this.mixRankService.find({
            ...user,
            ...params,
          });
        callThirdPartyId = _callThirdPartyId;
      } else if (companyDomain && name) {
        params = {companyDomain, name};
        const {callThirdPartyId: _callThirdPartyId} =
          await this.mixRankService.find({
            ...user,
            ...params,
          });
        callThirdPartyId = _callThirdPartyId;
      }
    } else if (TestPlatform === 'proxycurl') {
      const proxycurlRes = await this.proxycurlService.find(
        {
          userId: data.userId,
          userSource: data.userSource,
          linkedin: data.linkedin as string,
          companyDomain: data.companyDomain as string,
          name: data.name as string,
          firstName: data.firstName as string,
          lastName: data.lastName as string,
        },
        {
          needPhone: true,
          needEmail: true,
        }
      );
      // if -1, means noCredits
      callThirdPartyId = proxycurlRes.callThirdPartyId || -1;
    } else if (TestPlatform === 'snov') {
      if (linkedin) {
        params = {linkedin};
        const {callThirdPartyId: _callThirdPartyId} =
          await this.snovService.find({
            mode: 'byLinkedin',
            user: {
              ...user,
              ...params,
            },
          });
        callThirdPartyId = _callThirdPartyId;
      } else if (companyDomain && user.firstName && user.lastName) {
        params = {companyDomain};

        await this.snovService.find({
          mode: 'byDomain',
          user: {
            ...user,
            ...params,
          },
        });

        // callback mode
        return;
      }
    }

    // await this.mixRankService.find({
    //   ...user,
    //   ...params,
    // });
    const oldData = await this.prisma.peopleFinderTask.findFirst({
      where: {id: peopleFinderTaskId},
    });

    await this.prisma.peopleFinderTask.update({
      where: {id: peopleFinderTaskId},
      data: {
        status: PeopleFinderTaskStatus.completed,
        callThirdPartyIds: oldData?.callThirdPartyIds.concat([
          callThirdPartyId,
        ]),
      },
    });

    await this.peopleFinder.checkAndExecuteTaskBatchCallback(taskBatchId);

    return {};
  }
}
