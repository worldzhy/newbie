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
  PeopleFinderBullJob,
  PeopleFinderTaskStatus,
  PeopleFinderUserReq,
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
    const {data}: {data: PeopleFinderBullJob} = job;
    if (data) {
      let isGetEmail = false;
      const {findEmail, findPhone, ...user} = data;

      if (findPhone) {
        const findPhoneRes = await this.findPhone(user);
        isGetEmail = findPhoneRes.isGetEmail;
      }
      if (findEmail && !isGetEmail) {
        await this.findEmail(user);
      }
    }

    return {};
  }

  private async findPhone(data: PeopleFinderUserReq) {
    let isGetEmail = false;
    const newTask = await this.prisma.contactSearchTask.create({
      data: {
        taskId: data.taskId,
        status: PeopleFinderTaskStatus.pending,
      },
    });

    // Check if the current personnel have records on the current platform, and do not execute those with records
    const isExistTaskId = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.peopledatalabs,
      userId: data.userId,
      userSource: data.userSource,
    });

    let contactSearchId;
    if (isExistTaskId) {
      contactSearchId = isExistTaskId;
    } else {
      const findRes = await this.peopledatalabsService.find('byDomain', data, {
        needPhone: true,
        needEmail: false,
      });

      if (findRes) {
        if (findRes.dataFlag.email) isGetEmail = findRes.dataFlag.email;
        contactSearchId = findRes.contactSearchId;
      }
    }

    await this.prisma.contactSearchTask.update({
      where: {id: newTask.id},
      data: {
        contactSearchId,
        status: PeopleFinderTaskStatus.completed,
      },
    });
    return {isGetEmail};
  }

  private async findEmail(data: PeopleFinderUserReq) {
    const newTask = await this.prisma.contactSearchTask.create({
      data: {
        taskId: data.taskId,
        status: PeopleFinderTaskStatus.pending,
      },
    });

    // Check if the current personnel have records on the current platform, and do not execute those with records
    const isExistVoilanorbertTaskId = await this.peopleFinder.isExist({
      platform: PeopleFinderPlatforms.voilanorbert,
      userId: data.userId,
      userSource: data.userSource,
    });
    let contactSearchId;
    if (isExistVoilanorbertTaskId) {
      contactSearchId = isExistVoilanorbertTaskId;
    } else {
      const findRes = await this.voilaNorbertService.find(
        data,
        this.callBackOrigin +
          `/people-finder/voilanorbert-hook?taskId=${newTask.id}&id=`
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
          contactSearchId = isExistTaskId;
        } else {
          const findRes2 = await this.proxycurlService.find(data, {
            needPhone: true,
            needEmail: true,
          });
          if (findRes2) {
            contactSearchId = findRes2.contactSearchId;
          }
        }
      } else if (findRes) {
        contactSearchId = findRes.contactSearchId;
      }
    }

    await this.prisma.contactSearchTask.update({
      where: {id: newTask.id},
      data: {
        contactSearchId,
        status: PeopleFinderTaskStatus.completed,
      },
    });
  }
}
