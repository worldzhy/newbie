import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Processor, Process, InjectQueue} from '@nestjs/bull';
import {Job, Queue} from 'bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {PeopleFinderService} from '@microservices/people-finder/people-finder.service';
import {MixRankService} from '@microservices/people-finder/mixrank/mixrank.service';
import {
  PeopleFinderTaskBullJob,
  PeopleFinderTaskStatus,
} from '@microservices/people-finder/constants';

export const PeopleFinderTestQueue = 'people-finder-platform-test';
export const PauseTaskBatchIds = 'PAUSE_TASK_BATCH_IDS';

@Processor(PeopleFinderTestQueue)
@Injectable()
export class PeopleFinderJobProcessor {
  currentPauseTaskBatchIds?: number[];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinder: PeopleFinderService,
    private mixRankService: MixRankService,
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
