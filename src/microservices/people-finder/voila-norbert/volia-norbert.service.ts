import {HttpService} from '@nestjs/axios';
import {Logger, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {PeopleFinderCallThirdPartyDto} from '../people-finder.dto';
import {PeopleFinderNotificationService} from '../people-finder.notification.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  PeopleFinderSourceMode,
} from '../constants';
import {
  SearchEmailByDomainReqDto,
  SearchEmailResDto,
  SearchEmailThirdResDto,
  VoliaNorbertStatus,
  SearchEmailContentResDto,
} from './volia-norbert.dto';
export * from './volia-norbert.dto';

const baseUrl = 'https://api.voilanorbert.com/2018-01-08';
@Injectable()
export class VoilaNorbertService {
  private apiKey: string;
  private reqConfig: {
    auth: {
      username: string;
      password: string;
    };
    headers: object;
  };
  private loggerContext = 'Voilanorbert';

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinderNotification: PeopleFinderNotificationService,
    private readonly logger: Logger
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.voilanorbert.apiKey'
    );
    this.reqConfig = {
      auth: {
        username: 'inception',
        password: this.apiKey,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    // this.SearchEmailByDomain({
    //   name: 'yiwen',
    //   company: 'inceptionpad',
    //   domain: 'inceptionpad.com',
    // }).then(res => {
    //   console.log(res);
    // });
    // this.verifyEmail({email: 'yiwen@inceptionpad.com', webhook: ''});
  }

  /**
   * This endpoint is limited to 300 requests per minutes, and up to 100,000 requests per day max
   */
  async searchEmailByDomain({
    name,
    company,
    companyDomain,
    webhook,
    // list_id,
  }: SearchEmailByDomainReqDto): Promise<SearchEmailResDto> {
    const url = `${baseUrl}/search/name`;
    return new Promise(resolve => {
      const data = {
        name,
        company,
        domain: companyDomain,
        webhook,
      };
      let noCredits = false;
      this.httpService.axiosRef
        .post<SearchEmailByDomainReqDto, SearchEmailThirdResDto>(
          url,
          data,
          this.reqConfig
        )
        .then(async (res: SearchEmailThirdResDto) => {
          if (res.status === VoliaNorbertStatus.SUCCESS) {
            resolve({res: res.data});
            this.logger.log(
              'VoliaNorbert searchEmailByDomain success: ' +
                JSON.stringify(res.data),
              this.loggerContext
            );
          } else {
            if (res.status === VoliaNorbertStatus.INSUFFICIENT_CREDITS) {
              // notification webhook
              await this.peopleFinderNotification.send({
                message: '[VoliaNorbert] Not have enough credits',
              });
              noCredits = true;
            }
            const resError = {error: res.data, status: res.status};
            resolve({error: resError, noCredits});
            this.logger.error(
              'VoliaNorbert searchEmailByDomain error: ' +
                JSON.stringify(resError),
              this.loggerContext
            );
          }
        })
        .catch(e => {
          const resError = {error: e.response.data};
          resolve({error: resError, noCredits});
          this.logger.error(
            'VoliaNorbert searchEmailByDomain error: ' +
              JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }

  /**
   * voilanorbert [support: email]
   * only: companyDomain and name
   * @param webhook: xxxx.com?id=
   */
  async find(user: PeopleFinderCallThirdPartyDto, webhook: string) {
    const {name, companyDomain} = user;
    if (!name || !companyDomain) return;
    const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
      data: {
        ...user,
        source: PeopleFinderPlatforms.voilanorbert,
        sourceMode: PeopleFinderSourceMode.searchEmailByDomain,
        status: PeopleFinderStatus.pending,
      },
    });

    // todo spent
    const {res, error, noCredits} = await this.searchEmailByDomain({
      name,
      companyDomain,
      webhook: webhook + newRecord.id,
    });

    const result = await this.voilanorbertContactSearchCallback(
      newRecord.id,
      res,
      error
    );
    return {...result, noCredits};
  }

  async voilanorbertContactSearchCallback(
    id: number,
    data?: SearchEmailContentResDto,
    error?: object
  ) {
    const dataFlag = {
      email: false,
    };

    const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};
    if (error) {
      updateData.status = PeopleFinderStatus.failed;
      updateData.ctx = error;
    } else if (data) {
      if (!data.searching) {
        updateData.emails = data.email ? [data.email as object] : [];
        updateData.status = PeopleFinderStatus.completed;

        if (updateData.emails && updateData.emails.length)
          dataFlag.email = true;
      }
      updateData.ctx = data as object;
    }

    await this.prisma.peopleFinderCallThirdParty.update({
      where: {id},
      data: updateData,
    });

    return {error, res: data, dataFlag, callThirdPartyId: id};
  }
}
