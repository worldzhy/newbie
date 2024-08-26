import {Logger, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import * as ProxycurlApi from 'proxycurl-js-linkedin-profile-scraper';
import {PeopleFinderNotificationService} from '../people-finder.notification.service';
import {PeopleFinderCallThirdPartyDto} from '../people-finder.dto';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  SearchFilter,
  PeopleFinderSourceMode,
} from '../constants';
import {
  SearchPeopleLinkedinReqDto,
  SearchPeopleByLinkedinRes,
  SearchPeopleByLinkedinResDto,
  SearchPeopleLinkedinResDto,
  SearchPeopleByLinkedinReqDto,
  ErrorStatus,
} from './proxycurl.dto';

@Injectable()
export class ProxycurlService {
  private apiKey: string;
  private api;
  private loggerContext = 'Proxycurl';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private peopleFinderNotification: PeopleFinderNotificationService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.proxycurl.apiKey'
    );
    const defaultClient = ProxycurlApi.ApiClient.instance;
    // Configure Bearer access token for authorization: BearerAuth
    const BearerAuth = defaultClient.authentications['BearerAuth'];
    BearerAuth.accessToken = this.apiKey;
    this.api = new ProxycurlApi.PeopleAPIApi();

    // this.searchPeopleLinkedin({
    //   firstName: 'yiwen',
    //   domain: 'inceptionpad.com',
    // });
    // this.searchPeopleByLinkedin({
    //   linkedinUrl: 'https://www.linkedin.com/in/yiwen-mu',
    // });
  }

  /**
   * https://github.com/nubelaco/proxycurl-js-linkedin-profile-scraper/blob/main/docs/PeopleAPIApi.md
   * 1 credit
   */
  async searchPeopleLinkedin({
    firstName,
    companyDomain,
    lastName,
    location,
  }: SearchPeopleLinkedinReqDto): Promise<SearchPeopleLinkedinResDto> {
    return new Promise(resolve => {
      try {
        this.api.personLookupEndpoint(
          companyDomain,
          firstName,
          {
            location,
            // title
            lastName,
          },
          (error, data, response) => {
            let spent = 0;
            if (response.header['x-proxycurl-credit-cost']) {
              try {
                spent = Number(response.header['x-proxycurl-credit-cost']);
              } catch (e) {
                spent = 0;
              }
            }
            // data {url:string}
            if (error) {
              const resError = {error};
              resolve({error: resError, spent});
              this.logger.error(
                'Proxycurl searchPeopleLinkedin error: ' +
                  JSON.stringify(resError),
                this.loggerContext
              );
            } else {
              // response.body has more details
              resolve({res: response.body, spent});
              this.logger.log(
                'Proxycurl searchPeopleLinkedin success: ' +
                  JSON.stringify(response.body),
                this.loggerContext
              );
            }
          }
        );
      } catch (error) {
        this.catchErrorRes({
          error,
          errorTitle: 'Proxycurl searchPeopleLinkedin error: ',
          resolve,
        });
      }
    });
  }

  /**
   *
   * https://github.com/nubelaco/proxycurl-js-linkedin-profile-scraper/blob/main/docs/PeopleAPIApi.md
   * 1 credit
   */
  async searchPeopleByLinkedin({
    linkedinUrl,
    personalEmail,
    personalContactNumber,
  }: SearchPeopleByLinkedinReqDto): Promise<SearchPeopleByLinkedinResDto> {
    return new Promise(resolve => {
      try {
        this.api.personProfileEndpoint(
          linkedinUrl,
          'on-error',
          {
            // Costs an extra `1` credit per email returned on top of the cost of the base endpoint (if data is available).
            personalEmail,
            // Costs an extra `1` credit per number returned on top of the cost of the base endpoint (if data is available).
            personalContactNumber,
          },
          (error, data: SearchPeopleByLinkedinRes, response) => {
            let spent = 0;
            if (
              response &&
              response.header &&
              response.header['x-proxycurl-credit-cost']
            ) {
              try {
                spent = Number(response.header['x-proxycurl-credit-cost']);
              } catch (e) {
                spent = 0;
              }
            }
            if (error) {
              const resError = {error};
              resolve({error: resError, spent});
              this.logger.error(
                'Proxycurl searchPeopleByLinkedin error: ' +
                  JSON.stringify(resError),
                this.loggerContext
              );
            } else {
              resolve({res: data, spent});
              this.logger.log(
                'Proxycurl searchPeopleByLinkedin success: ' +
                  JSON.stringify(data),
                this.loggerContext
              );
            }
          }
        );
      } catch (error) {
        this.catchErrorRes({
          error,
          errorTitle: 'Proxycurl searchPeopleByLinkedin error: ',
          resolve,
        });
      }
    });
  }
  catchErrorRes = ({
    error,
    errorTitle,
    resolve,
  }: {
    error: unknown;
    errorTitle: string;
    resolve: (error: object) => void;
  }) => {
    const resError = {error, spent: 0};
    resolve({error: resError});
    this.logger.error(
      errorTitle + JSON.stringify(resError),
      this.loggerContext
    );
  };

  /**
   * proxycurl [support: email,phone]
   */
  async find(
    user: PeopleFinderCallThirdPartyDto,
    {needPhone, needEmail}: SearchFilter
  ): Promise<{
    res?: object;
    error?: object;
    dataFlag: {
      email: boolean;
      phone: boolean;
    };
    callThirdPartyId?: number;
    noCredits?: boolean;
  }> {
    const dataFlag = {
      email: false,
      phone: false,
    };
    let noCredits = false;
    if (user.linkedin) {
      const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
        data: {
          ...user,
          sourceMode: PeopleFinderSourceMode.searchPeopleByLinkedin,
          source: PeopleFinderPlatforms.proxycurl,
          status: PeopleFinderStatus.pending,
        },
      });
      const {res, error, spent} = await this.searchPeopleByLinkedin({
        linkedinUrl: user.linkedin,
        personalEmail: needEmail ? 'include' : 'exclude',
        personalContactNumber: needPhone ? 'include' : 'exclude',
      });
      const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};

      if (error) {
        updateData.status = PeopleFinderStatus.failed;
        updateData.ctx = error as object;
        // notification webhook
        if (
          error.error &&
          error.error.status === ErrorStatus.INSUFFICIENT_CREDITS
        ) {
          await this.peopleFinderNotification.send({
            message: '[proxycurl] Not have enough credits',
          });
          noCredits = true;
        }
      } else if (res) {
        updateData.emails = res.personal_emails;
        updateData.phones = res.personal_numbers;

        if (updateData.emails && updateData.emails.length)
          dataFlag.email = true;

        if (updateData.phones && updateData.phones.length)
          dataFlag.phone = true;

        updateData.status = PeopleFinderStatus.completed;
        updateData.ctx = res as object;
      }
      updateData.spent = spent;

      await this.prisma.peopleFinderCallThirdParty.update({
        where: {id: newRecord.id},
        data: updateData,
      });

      return {res, error, dataFlag, callThirdPartyId: newRecord.id, noCredits};
    } else if (user.companyDomain && user.firstName) {
      const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
        data: {
          ...user,
          sourceMode: PeopleFinderSourceMode.searchPeopleLinkedin,
          source: PeopleFinderPlatforms.proxycurl,
          status: PeopleFinderStatus.pending,
        },
      });

      const {res, error, spent} = await this.searchPeopleLinkedin({
        firstName: user.firstName,
        lastName: user.lastName,
        companyDomain: user.companyDomain,
      });

      const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};

      if (error) {
        updateData.status = PeopleFinderStatus.failed;
        updateData.ctx = error as object;
        // notification webhook
        if (
          error.error &&
          error.error.status === ErrorStatus.INSUFFICIENT_CREDITS
        ) {
          await this.peopleFinderNotification.send({
            message: '[proxycurl] Not have enough credits',
          });
          noCredits = true;
        }
      } else if (res && res.url) {
        updateData.linkedin = res.url;
        updateData.status = PeopleFinderStatus.completed;
        updateData.ctx = res as object;
      } else {
        updateData.status = PeopleFinderStatus.failed;
        updateData.ctx = res as object;
      }
      updateData.spent = spent;

      await this.prisma.peopleFinderCallThirdParty.update({
        where: {id: newRecord.id},
        data: updateData,
      });

      if (res && res.url) {
        return await this.find(
          {
            ...user,
            linkedin: res.url,
          },
          {needPhone, needEmail}
        );
      }
      return {res, error, dataFlag, callThirdPartyId: newRecord.id, noCredits};
    }
    return {
      res: undefined,
      error: undefined,
      dataFlag,
      callThirdPartyId: undefined,
      noCredits,
    };
  }
}
