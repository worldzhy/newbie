import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Processor, Process} from '@nestjs/bull';
import {Job} from 'bull';
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
    private peopledatalabsService: PeopledatalabsService
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
        taskBranchId,
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
        await this.peopleFinder.checkAndExecuteTaskBranchCallback(taskBranchId);
      }
    }

    return {};
  }

  private async findPhone(
    peopleFinderTaskId: number,
    data: PeopleFinderUserReq
  ) {
    let isGetEmail = false;

    // Check if the current personnel have records on the current platform, and do not execute those with records
    const isExistTaskId = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.peopledatalabs,
      userId: data.userId,
      userSource: data.userSource,
    });

    let callThirdPartyId;
    if (isExistTaskId) {
      callThirdPartyId = isExistTaskId;
    } else {
      const findRes = await this.peopledatalabsService.find('byDomain', data, {
        needPhone: true,
        needEmail: false,
      });

      if (findRes) {
        if (findRes.dataFlag.email) isGetEmail = findRes.dataFlag.email;
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
    const isExistVoilanorbertTaskId = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.voilanorbert,
      userId: data.userId,
      userSource: data.userSource,
    });
    let callThirdPartyId;
    if (isExistVoilanorbertTaskId) {
      callThirdPartyId = isExistVoilanorbertTaskId;
    } else {
      const findRes = await this.voilaNorbertService.find(
        data,
        this.callBackOrigin +
          `/people-finder/voilanorbert-hook?taskId=${peopleFinderTaskId}&id=`
      );

      // searching completed && no email
      if (findRes?.res?.searching === false && !findRes?.dataFlag.email) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExistTaskId = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.proxycurl,
          userId: data.userId,
          userSource: data.userSource,
        });
        if (isExistTaskId) {
          callThirdPartyId = isExistTaskId;
        } else {
          const findRes2 = await this.proxycurlService.find(data, {
            needPhone: true,
            needEmail: true,
          });
          if (findRes2) {
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
    return isGetEmailIng;
  }
}
