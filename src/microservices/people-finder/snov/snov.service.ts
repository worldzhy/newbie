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
  ByDomainSearchResDto,
  ByLinkedinSearchResDto,
  SnovEmailByDomainResDto,
  SnovEmailByLinkedinResDto,
} from './snov.dto';
export * from './snov.dto';

// The API rate is limited to 60 requests per minute.
const baseUrl = 'https://api.snov.io';

@Injectable()
export class SnovService {
  private access_token: string;
  private token_type: string;
  private client_id: string;
  private client_secret: string;
  private cookie: string;
  private loggerContext = 'Snov';
  private webhook: string;

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinderNotification: PeopleFinderNotificationService,
    private readonly logger: CustomLoggerService
  ) {
    this.client_id = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.snov.client_id'
    );
    this.client_secret = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.snov.client_secret'
    );
    this.webhook = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.snov.callback'
    );
  }

  private async getAccessToken() {
    const url = `${baseUrl}/v1/oauth/access_token`;
    try {
      const response = await this.httpService.axiosRef.post(
        url,
        {
          grant_type: 'client_credentials',
          client_id: this.client_id,
          client_secret: this.client_secret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const {data} = response;
      if (data.success) {
        this.access_token = data.access_token;
        this.token_type = data.token_type;
        // 保存 Cookie
        const cookies = response.headers['set-cookie'];
        if (cookies?.length) {
          this.cookie = cookies[0].split(';')[0];
        }
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        'Snov getAccessToken error: ' + JSON.stringify(error),
        this.loggerContext
      );
      return false;
    }
  }

  private async handleTokenError(error: any): Promise<boolean> {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return await this.getAccessToken();
    }
    return false;
  }

  async searchEmailByDomain({
    domain,
    firstName,
    lastName,
    webhook,
  }: any): Promise<ByDomainSearchResDto> {
    // https://snov.io/api
    const url = `${baseUrl}/v2/emails-by-domain-by-name/start`;
    return new Promise(resolve => {
      let noCredits = false;
      this.httpService.axiosRef
        .post<any, any>(url, {
          headers: {
            authorization: `${this.token_type} ${this.access_token}`,
            'Content-Type': 'application/json',
            Cookie: this.cookie,
          },
          params: {
            ...(domain && {domain}),
            ...(firstName && {first_name: firstName}),
            ...(lastName && {last_name: lastName}),
            webhook,
          },
        })
        .then(async res => {
          const data: SnovEmailByDomainResDto = res.data;
          if (data.status === 'completed') {
            resolve({res: data});
            this.logger.log(
              'Snov searchEmailByBomain success: ' + JSON.stringify(data),
              this.loggerContext
            );
          } else {
            // if (res.status === MixRankStatus.INSUFFICIENT_CREDITS) {
            //   await this.peopleFinderNotification.send({
            //     message: '[MixRank] Not have enough credits',
            //   });
            //   noCredits = true;
            // }
            const resError = {
              error: data.status || 'data.errors',
              status: res.status,
            };
            resolve({error: resError, noCredits});
            this.logger.error(
              'Snov searchEmailByBomain error: ' + JSON.stringify(resError),
              this.loggerContext
            );
          }
        })
        .catch(async e => {
          // 处理 token 失效
          if (await this.handleTokenError(e)) {
            // token 刷新成功，重试请求
            return this.searchEmailByDomain({domain, firstName, lastName, webhook});
          }
          const resError = {error: e.response.data};
          resolve({error: resError, noCredits});
          this.logger.error(
            'Snov searchEmailByBomain error: ' + JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }

  async searchEmailByLinkedin({
    linkedin,
  }: any): Promise<ByLinkedinSearchResDto> {
    // https://snov.io/api
    const addUrl = `${baseUrl}/v1/add-url-for-search`;
    const getResultUrl = `${baseUrl}/v1/get-emails-from-url`;
    const headers = {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
    const params = {
      access_token: this.access_token,
      url: linkedin,
    };

    try {
      await this.httpService.axiosRef.post(addUrl, params, {
        headers,
      });
    } catch (e) {
      console.log(e);
    }

    return new Promise(resolve => {
      let noCredits = false;
      this.httpService.axiosRef
        .post<any, any>(getResultUrl, params, {headers})
        .then(async res => {
          console.log(res);
          const data: SnovEmailByLinkedinResDto = res.data;
          if (data.success) {
            resolve({res: data as SnovEmailByLinkedinResDto});
            this.logger.log(
              'Snov searchEmailByLinkedin success: ' + JSON.stringify(data),
              this.loggerContext
            );
          } else {
            // if (res.status === MixRankStatus.INSUFFICIENT_CREDITS) {
            //   await this.peopleFinderNotification.send({
            //     message: '[MixRank] Not have enough credits',
            //   });
            //   noCredits = true;
            // }
            const resError = {
              error: 'error', // || data.errors,
              status: res.status,
            };
            resolve({error: resError, noCredits});
            this.logger.error(
              'Snov searchEmailByLinkedin error: ' + JSON.stringify(resError),
              this.loggerContext
            );
          }
        })
        .catch(async e => {
          // 处理 token 失效
          if (await this.handleTokenError(e)) {
            // token 刷新成功，重试请求
            return this.searchEmailByLinkedin({linkedin});
          }
          const resError = {error: e.response.data};
          resolve({error: resError, noCredits});
          this.logger.error(
            'Snov searchEmailByLinkedin error: ' + JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }

  async find({
    mode,
    user,
    taskId,
  }: {
    mode: 'byLinkedin' | 'byDomain';
    user: PeopleFinderCallThirdPartyDto;
    taskId?: string;
  }) {
    const {companyDomain, firstName, lastName, linkedin} = user;
    if (!this.access_token) {
      await this.getAccessToken();
    }

    const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
      data: {
        ...user,
        source: PeopleFinderPlatforms.snov,
        sourceMode:
          mode === 'byLinkedin'
            ? PeopleFinderSourceMode.searchPeopleLinkedin
            : PeopleFinderSourceMode.searchEmailByDomain,
        status: PeopleFinderStatus.pending,
      },
    });

    if (mode === 'byDomain') {
      await this.searchEmailByDomain({
        domain: companyDomain,
        firstName,
        lastName,
        webhook: `${this.webhook}?id=${newRecord.id}&taskId=${taskId}`,
      });
    } else if (mode === 'byLinkedin') {
      const {res} = await this.searchEmailByLinkedin({linkedin});
      if (res) {
        const emails = res?.data.emails.map(item => item.email);
        const status = res.success
          ? PeopleFinderStatus.completed
          : PeopleFinderStatus.failed;

        await this.searchCallback({
          id: Number(newRecord.id),
          status,
          emails,
          data: res,
        });
      }
    }

    return {callThirdPartyId: newRecord.id};

    // const result = await this.mixrankPersonMatchCallback(
    //   newRecord.id,
    //   res,
    //   error
    // );
    // return {...result, noCredits};
  }

  async searchCallback({
    id,
    data,
    status,
    emails,
  }: {
    id: number;
    data: SnovEmailByDomainResDto | SnovEmailByLinkedinResDto;
    status: string;
    emails?: string[];
  }) {
    const dataFlag = {
      person: false,
    };

    const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {
      ...(status && {status}),
      ...(emails && {emails}),
    };
    updateData.ctx = data as object;

    await this.prisma.peopleFinderCallThirdParty.update({
      where: {id},
      data: updateData,
    });

    return {res: data, dataFlag, callThirdPartyId: id};
  }
}
