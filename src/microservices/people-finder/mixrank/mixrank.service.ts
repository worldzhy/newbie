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
  // MixRankStatus,
  Result,
} from './mixrank.dto';
export * from './mixrank.dto';

const baseUrl = 'https://api.mixrank.com/v2/json';

@Injectable()
export class MixRankService {
  private apiKey: string;
  private loggerContext = 'MixRank';

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinderNotification: PeopleFinderNotificationService,
    private readonly logger: CustomLoggerService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.mixrank.apiKey'
    );
  }

  async personMatch({
    social_url,
    domain,
    name,
  }: PersonMatchReqDto): Promise<PersonMatchResDto> {
    // https://mixrank.com/api/documentation#/person/match
    const url = `${baseUrl}/${this.apiKey}/person/match`;
    return new Promise(resolve => {
      let noCredits = false;
      this.httpService.axiosRef
        .get<PersonMatchReqDto, PersonMatchThirdResDto>(url, {
          params: {
            ...(social_url && {social_url}),
            ...(domain && {domain}),
            ...(name && {name}),
          },
        })
        .then(async (res: PersonMatchThirdResDto) => {
          const data = res.data;
          if (!data.errors) {
            resolve({res: data.results});
            this.logger.log(
              'MixRank personMatch success: ' + JSON.stringify(data),
              this.loggerContext
            );
          } else {
            // if (res.status === MixRankStatus.INSUFFICIENT_CREDITS) {
            //   await this.peopleFinderNotification.send({
            //     message: '[MixRank] Not have enough credits',
            //   });
            //   noCredits = true;
            // }
            const resError = {error: data.errors, status: res.status};
            resolve({error: resError, noCredits});
            this.logger.error(
              'MixRank personMatch error: ' + JSON.stringify(resError),
              this.loggerContext
            );
          }
        })
        .catch(e => {
          const resError = {error: e.response.data};
          resolve({error: resError, noCredits});
          this.logger.error(
            'MixRank personMatch error: ' + JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }

  async find(user: PeopleFinderCallThirdPartyDto) {
    const {companyDomain, name, linkedin} = user;

    const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
      data: {
        ...user,
        source: PeopleFinderPlatforms.mixrank,
        sourceMode: linkedin
          ? PeopleFinderSourceMode.searchPeopleLinkedin
          : PeopleFinderSourceMode.searchPeopleByDomain,
        status: PeopleFinderStatus.pending,
      },
    });

    const {res, error, noCredits} = await this.personMatch({
      domain: companyDomain,
      name,
      social_url: linkedin,
    });

    const result = await this.mixrankPersonMatchCallback(
      newRecord.id,
      res,
      error
    );
    return {...result, noCredits};
  }

  // PersonMatchResDto['res']
  async mixrankPersonMatchCallback(
    id: number,
    data?: Result[],
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
      updateData.emails = data
        .flatMap(item => item.emails)
        .map(item => item.email);
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
