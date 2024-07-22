import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Processor, Process, InjectQueue} from '@nestjs/bull';
import {Job, Queue} from 'bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {VoilaNorbertService} from '@microservices/people-finder/voila-norbert/volia-norbert.service';
import {ProxycurlService} from '@microservices/people-finder/proxycurl/proxycurl.service';
import {PeopledatalabsService} from '@microservices/people-finder/peopledatalabs/peopledatalabs.service';
import {PeopleFinderService} from '@microservices/people-finder/people-finder.service';
import {
  PeopleFinderPlatforms,
  PeopleFinderTaskBullJob,
  PeopleFinderUserReq,
  PeopleFinderTaskStatus,
  PeopleFinderSourceMode,
} from '@microservices/people-finder/constants';

export const PeopleFinderQueue = 'people-finder';

@Processor(PeopleFinderQueue)
@Injectable()
export class PeopleFinderJobProcessor {
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinder: PeopleFinderService,
    private voilaNorbertService: VoilaNorbertService,
    private proxycurlService: ProxycurlService,
    private peopledatalabsService: PeopledatalabsService,
    @InjectQueue(PeopleFinderQueue) public queue: Queue
  ) {
    this.callBackOrigin = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.voilanorbert.callbackOrigin'
    );
  }

  @Process({concurrency: 1})
  async peopleFinderProcess(job: Job) {
    const {data}: {data: PeopleFinderTaskBullJob} = job;

    if (data) {
      let isGetEmail = false;
      let isGetEmailIng = false;
      const {
        findEmail,
        findPhone,
        id: peopleFinderTaskId,
        taskBatchId,
        ...user
      } = data;

      if (findPhone) {
        const findPhoneRes = await this.findPhone(peopleFinderTaskId, user);
        isGetEmail = findPhoneRes.isGetEmail;
      }
      if (findEmail && !isGetEmail) {
        isGetEmailIng = await this.findEmail(peopleFinderTaskId, user);
      }

      if (!isGetEmailIng) {
        await this.prisma.peopleFinderTask.update({
          where: {id: Number(peopleFinderTaskId)},
          data: {
            status: PeopleFinderTaskStatus.completed,
          },
        });
        await this.peopleFinder.checkAndExecuteTaskBatchCallback(taskBatchId);
      }
    }

    return {};
  }

  /** only need domain */
  private async findPhone(
    peopleFinderTaskId: number,
    data: PeopleFinderUserReq
  ) {
    let isGetEmail = false;

    let sourceMode;
    let findWay;
    // sourceMode
    if (data.linkedin) {
      sourceMode = PeopleFinderSourceMode.searchPeopleByLinkedin;
      findWay = 'byLinkedin';
    } else if (data.companyDomain) {
      sourceMode = PeopleFinderSourceMode.searchPeopleByDomain;
      findWay = 'byDomain';

      const isExistLinkedin = await this.peopleFinder.isExist({
        platform: PeopleFinderPlatforms.peopledatalabs,
        // remove companyDomain, Otherwise it will be treated as a conditional query
        data: {...data, companyDomain: ''},
        sourceMode: PeopleFinderSourceMode.searchPeopleByLinkedin,
      });
      // If there was data previously sourced from 'byLinkedin', skip the find.
      if (isExistLinkedin && isExistLinkedin.phones.length > 0) {
        return {isGetEmail};
      }
    } else {
      return {isGetEmail};
    }

    // Check if the current personnel have records on the current platform, and do not execute those with records
    const isExistTask = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.peopledatalabs,
      data,
      sourceMode,
    });

    let callThirdPartyId: number = 0;
    if (isExistTask) {
      callThirdPartyId = isExistTask.id;
    } else {
      const findRes = await this.peopledatalabsService.find(findWay, data, {
        needPhone: true,
        needEmail: false,
      });

      if (findRes) {
        if (findRes.dataFlag.email) isGetEmail = findRes.dataFlag.email;
        if (findRes.noCredits) {
          await this.queue.pause();
        }
        callThirdPartyId = findRes.callThirdPartyId;
      }
    }

    const oldData = await this.prisma.peopleFinderTask.findFirst({
      where: {id: peopleFinderTaskId},
    });

    await this.prisma.peopleFinderTask.update({
      where: {id: peopleFinderTaskId},
      data: {
        callThirdPartyIds: oldData?.callThirdPartyIds.concat([
          callThirdPartyId,
        ]),
      },
    });

    return {isGetEmail};
  }

  private async findEmail(
    peopleFinderTaskId: number,
    data: PeopleFinderUserReq
  ) {
    let isGetEmailIng = false;
    // Check if the current personnel have records on the current platform, and do not execute those with records
    const isExistVoilanorbertTask = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.voilanorbert,
      data,
      sourceMode: PeopleFinderSourceMode.searchEmailByDomain,
    });
    let callThirdPartyId: number = 0;
    if (isExistVoilanorbertTask) {
      callThirdPartyId = isExistVoilanorbertTask.id;
    } else {
      const findRes = await this.voilaNorbertService.find(
        data,
        this.callBackOrigin +
          `/people-finder/voilanorbert-hook?taskId=${peopleFinderTaskId}&id=`
      );

      if (findRes?.noCredits) {
        await this.queue.pause();
      }

      // not domain or not name || searching completed && no email
      if (
        !findRes ||
        (findRes?.res?.searching === false && !findRes?.dataFlag.email)
      ) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExistTask = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.proxycurl,
          data,
          sourceMode: PeopleFinderSourceMode.searchPeopleByLinkedin,
        });
        if (isExistTask) {
          callThirdPartyId = isExistTask.id;
        } else {
          const findRes2 = await this.proxycurlService.find(data, {
            needPhone: true,
            needEmail: true,
          });
          if (findRes2?.noCredits) {
            await this.queue.pause();
          }
          if (findRes2.callThirdPartyId) {
            callThirdPartyId = findRes2.callThirdPartyId;
          }
        }
      } else if (findRes) {
        callThirdPartyId = findRes.callThirdPartyId;
      }

      if (findRes?.res?.searching) {
        isGetEmailIng = true;
      }
    }

    // If not domain, findRes will be undefined, so callThirdPartyId is undefined
    if (callThirdPartyId) {
      const oldData = await this.prisma.peopleFinderTask.findFirst({
        where: {id: peopleFinderTaskId},
      });

      await this.prisma.peopleFinderTask.update({
        where: {id: peopleFinderTaskId},
        data: {
          callThirdPartyIds: oldData?.callThirdPartyIds.concat([
            callThirdPartyId,
          ]),
        },
      });
    }

    return isGetEmailIng;
  }
}
