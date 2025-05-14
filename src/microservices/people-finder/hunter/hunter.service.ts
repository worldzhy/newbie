import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {PeopleFinderCallThirdPartyDto} from '../people-finder.dto';
import {PeopleFinderNotificationService} from '../people-finder.notification.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  PeopleFinderSourceMode,
} from '../constants';
import {
  PersonMatchReqDto,
  PersonMatchResDto,
  PersonMatchThirdResDto,
  PersonMatchThirdRes,
  // HunterStatus,
} from './hunter.dto';
export * from './hunter.dto';

const baseUrl = 'https://api.hunter.io';

@Injectable()
export class HunterService {
  private apiKey: string;
  private loggerContext = 'Hunter';

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinderNotification: PeopleFinderNotificationService,
    private readonly logger: CustomLoggerService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.hunter.apiKey'
    );
  }

  async personMatch({
    domain,
    firstName,
    lastName,
  }: PersonMatchReqDto): Promise<PersonMatchResDto> {
    // https://hunter.io/api-documentation/v2#email-finder
    const url = `${baseUrl}/v2/email-finder`;
    return new Promise(resolve => {
      let noCredits = false;
      this.httpService.axiosRef
        .get<PersonMatchReqDto, PersonMatchThirdResDto>(url, {
          params: {
            ...(domain && {domain}),
            ...(firstName && {first_name: firstName}),
            ...(lastName && {last_name: lastName}),
            api_key: this.apiKey,
          },
        })
        .then(async res => {
          const data = res.data;
          if (data.data) {
            resolve({res: data.data});
            this.logger.log(
              'Hunter personMatch success: ' + JSON.stringify(data),
              this.loggerContext
            );
          } else {
            // if (res.status === HunterStatus.INSUFFICIENT_CREDITS) {
            //   await this.peopleFinderNotification.send({
            //     message: '[Hunter] Not have enough credits',
            //   });
            //   noCredits = true;
            // }
            const resError = {error: data, status: res.status};
            resolve({error: resError, noCredits});
            this.logger.error(
              'Hunter personMatch error: ' + JSON.stringify(resError),
              this.loggerContext
            );
          }
        })
        .catch(e => {
          const resError = {error: e.response.data};
          resolve({error: resError, noCredits});
          this.logger.error(
            'Hunter personMatch error: ' + JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }

  async find(user: PeopleFinderCallThirdPartyDto) {
    const {companyDomain, firstName, lastName} = user;

    const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
      data: {
        ...user,
        source: PeopleFinderPlatforms.hunter,
        sourceMode: PeopleFinderSourceMode.searchEmailByDomain,
        status: PeopleFinderStatus.pending,
      },
    });

    const {res, error, noCredits} = await this.personMatch({
      domain: companyDomain,
      firstName,
      lastName,
    });

    const result = await this.hunterPersonMatchCallback(
      newRecord.id,
      res,
      error
    );
    return {...result, noCredits};
  }

  // PersonMatchResDto['res']
  async hunterPersonMatchCallback(
    id: number,
    data?: PersonMatchThirdRes['data'],
    error?: object
  ) {
    const dataFlag = {
      person: false,
    };

    const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};
    if (error) {
      updateData.status = PeopleFinderStatus.failed;
      updateData.ctx = error;
    } else if (data) {
      updateData.status = PeopleFinderStatus.completed;
      if (data.email) updateData.emails = [data.email];
      if (data.phone_number) updateData.phones = [data.phone_number];
      updateData.ctx = data as object;
      dataFlag.person = true;
    }

    await this.prisma.peopleFinderCallThirdParty.update({
      where: {id},
      data: updateData,
    });

    return {error, res: data, dataFlag, callThirdPartyId: id};
  }
}
