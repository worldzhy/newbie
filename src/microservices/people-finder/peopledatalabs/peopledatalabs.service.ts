import {Logger, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as PDLJS from 'peopledatalabs';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {PeopleFinderCallThirdPartyDto} from '../people-finder.dto';
import {PeopleFinderNotificationService} from '../people-finder.notification.service';
import {
  SearchPeopleByDomainReqDto,
  SearchPeopleResDto,
  SearchPeopleArrayResDto,
  SearchPeopleByLinkedinReqDto,
  PeopledatalabsStatus,
} from './peopledatalabs.dto';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  SearchFilter,
  PeopleFinderSourceMode,
} from '../constants';

export * from './peopledatalabs.dto';

@Injectable()
export class PeopledatalabsService {
  private apiKey: string;
  private api;
  private loggerContext = 'Peopledatalabs';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private peopleFinderNotification: PeopleFinderNotificationService,
    private readonly logger: Logger
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservices.peopleFinder.peopledatalabs.apiKey'
    );
    // @ts-ignore
    this.api = new PDLJS({apiKey: this.apiKey});

    // this.searchPeopleByDomain({
    //   fullName: 'Jovan Bethell',
    //   domain: 'pioneerinterests.com',
    // });
    // this.searchPeopleByLinkedin({
    //   linkedinUrl: 'https://www.linkedin.com/in/yiwen-mu',
    // });
  }

  /**
   * rateLimitLimit:{minute: 10}
   * https://docs.peopledatalabs.com/docs/quickstart-person-enrichment-api
   * 1 credit
   */
  async searchPeopleByDomain({
    name,
    companyDomain,
    needPhone,
    needEmail,
  }: SearchPeopleByDomainReqDto): Promise<SearchPeopleArrayResDto> {
    const should: {exists: {field: string}}[] = [];
    if (needPhone) {
      should.push({exists: {field: 'phone_numbers'}});
    }
    if (needEmail) {
      should.push({exists: {field: 'emails'}});
    }
    return new Promise(resolve => {
      const esQuery = {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should,
                },
              },
              {match: {full_name: name}},
              {match: {job_company_website: companyDomain}},
            ],
          },
        },
      };
      const params = {
        searchQuery: esQuery,
        size: 1,
        pretty: true,
      };
      try {
        this.api.person.search
          .elastic(params)
          .then(res => {
            if (res.status === PeopledatalabsStatus.SUCCESS) {
              resolve({res: res});
              this.logger.log(
                'Peopledatalabs searchPeopleByDomain success: ' +
                  JSON.stringify(res),
                this.loggerContext
              );
            } else {
              const resError = {error: res.status, ctx: res};
              resolve({error: resError});
              this.logger.error(
                'Peopledatalabs searchPeopleByDomain error: ' +
                  JSON.stringify(resError),
                this.loggerContext
              );
            }
          })
          .catch(error => {
            this.catchErrorRes({
              error,
              errorTitle: 'Peopledatalabs searchPeopleByDomain error: ',
              resolve,
            });
          });
      } catch (error) {
        this.catchErrorRes({
          error,
          errorTitle: 'Peopledatalabs searchPeopleByDomain error: ',
          resolve,
        });
      }
    });
  }

  /**
   * rateLimitLimit:{minute: 100}
   * Our default limit for free customers is 100 per minute. Our default limit for paying customers is 1,000 per minute.
   * The speed limit is related to the current account level
   * https://docs.peopledatalabs.com/docs/quickstart-person-enrichment-api
   * 1 credit
   */
  async searchPeopleByLinkedin({
    linkedinUrl,
  }: SearchPeopleByLinkedinReqDto): Promise<SearchPeopleResDto> {
    return new Promise(resolve => {
      const params = {
        profile: linkedinUrl,
      };
      try {
        // Pass the parameters object to the Person Enrichment API
        this.api.person
          .enrichment(params)
          .then(res => {
            if (res.status === PeopledatalabsStatus.SUCCESS) {
              resolve({res});
              this.logger.log(
                'Peopledatalabs searchPeopleByLinkedin success: ' +
                  JSON.stringify(res),
                this.loggerContext
              );
            } else {
              const resError = {error: res.status, ctx: res};
              resolve({error: resError});
              this.logger.error(
                'Peopledatalabs searchPeopleByLinkedin error: ' +
                  JSON.stringify(resError),
                this.loggerContext
              );
            }
          })
          .catch(error => {
            this.catchErrorRes({
              error,
              errorTitle: 'Peopledatalabs searchPeopleByLinkedin error: ',
              resolve,
            });
          });
      } catch (error) {
        this.catchErrorRes({
          error,
          errorTitle: 'Peopledatalabs searchPeopleByLinkedin error: ',
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
    const resError = {error};
    resolve({error: resError});
    this.logger.error(
      errorTitle + JSON.stringify(resError),
      this.loggerContext
    );
  };

  /**
   * peopledatalabs [support: email,phone]
   */
  async find(
    mode: 'byLinkedin' | 'byDomain',
    user: PeopleFinderCallThirdPartyDto,
    {needPhone, needEmail}: SearchFilter
  ) {
    const dataFlag = {
      email: false,
      phone: false,
    };
    let noCredits = false;
    if (mode === 'byLinkedin') {
      if (user.linkedin) {
        const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
          data: {
            ...user,
            sourceMode: PeopleFinderSourceMode.searchPeopleByLinkedin,
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });

        const {error, res} = await this.searchPeopleByLinkedin({
          linkedinUrl: user.linkedin,
        });

        const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
          // notification webhook
          if (
            error.error &&
            error.error.status === PeopledatalabsStatus.PAYMENT_REQUIRED
          ) {
            await this.peopleFinderNotification.send({
              message: '[peopledatalabs] Not have enough credits',
            });
            noCredits = true;
          }
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          if (res.data) {
            updateData.emails = res.data.emails as object[];
            updateData.phones = res.data.phone_numbers
              ? res.data.phone_numbers
              : [];
            if (res.data.mobile_phone) {
              updateData.phones.push(res.data.mobile_phone);
            }

            if (updateData.emails && updateData.emails.length)
              dataFlag.email = true;

            if (updateData.phones && updateData.phones.length)
              dataFlag.phone = true;

            updateData.status = PeopleFinderStatus.completed;
            updateData.ctx = res as object;
          } else {
            updateData.status = PeopleFinderStatus.failed;
            updateData.ctx = {
              msg: 'No data records were found for this person',
              res: res as object,
            };
          }
        }

        await this.prisma.peopleFinderCallThirdParty.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        return {
          error,
          res,
          dataFlag,
          callThirdPartyId: newRecord.id,
          noCredits,
        };
      } else {
        const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
          data: {
            ...user,
            sourceMode: PeopleFinderSourceMode.searchPeopleByLinkedin,
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.parameterError,
          },
        });
        return {
          error: {error: 'Missing parameters'},
          dataFlag,
          callThirdPartyId: newRecord.id,
        };
      }

      // If not found, use domain query
      // if (
      //   !res ||
      //   ((!res.data.emails || !res.data.emails.length) &&
      //     (!res.data.phone_numbers || !res.data.phone_numbers.length))
      // ) {
      //   await this.peopledatalabs.searchPeopleByDomain({
      //     companyDomain: user.companyDomain,
      //     name: user.name,
      //     phone,
      //     email,
      //   });
      // }
    }
    if (mode === 'byDomain') {
      if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
          data: {
            ...user,
            sourceMode: PeopleFinderSourceMode.searchPeopleByDomain,
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });

        const {error, res} = await this.searchPeopleByDomain({
          companyDomain: user.companyDomain,
          name: user.name,
          needPhone,
          needEmail,
        });

        const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
          // notification webhook
          if (
            error.error &&
            error.error.status === PeopledatalabsStatus.PAYMENT_REQUIRED
          ) {
            await this.peopleFinderNotification.send({
              message: '[peopledatalabs] Not have enough credits',
            });
            noCredits = true;
          }
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          const dataArray = res.data;
          if (dataArray.length) {
            updateData.emails = dataArray[0].emails as object;
            let phones: string[] = [];
            if (dataArray[0].phone_numbers) {
              phones = [...dataArray[0].phone_numbers];
            }
            if (dataArray[0].mobile_phone) {
              phones.push(dataArray[0].mobile_phone);
            }
            // linkedin
            if (dataArray[0].linkedin_url) {
              updateData.linkedins = [dataArray[0].linkedin_url];
            }
            updateData.phones = phones;
            updateData.status = PeopleFinderStatus.completed;
            updateData.ctx = res as object;
          } else if (!dataArray || !dataArray.length) {
            updateData.status = PeopleFinderStatus.failed;
            updateData.ctx = {
              msg: 'No data records were found for this person',
              res: res as object,
            };
          }
        }

        await this.prisma.peopleFinderCallThirdParty.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        return {
          error,
          res,
          dataFlag,
          callThirdPartyId: newRecord.id,
          noCredits,
        };
      } else {
        const newRecord = await this.prisma.peopleFinderCallThirdParty.create({
          data: {
            ...user,
            sourceMode: PeopleFinderSourceMode.searchPeopleByDomain,
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.parameterError,
          },
        });

        return {
          error: {error: 'Missing parameters'},
          dataFlag,
          callThirdPartyId: newRecord.id,
        };
      }
    }
  }
}
