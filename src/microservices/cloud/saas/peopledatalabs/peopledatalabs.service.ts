import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as PDLJS from 'peopledatalabs';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {
  SearchPeopleByDomainReqDto,
  SearchPeopleResDto,
  SearchPeopleArrayResDto,
  SearchPeopleByLinkedinReqDto,
  PeopledatalabsStatus,
} from './peopledatalabs.dto';

export * from './peopledatalabs.dto';

@Injectable()
export class PeopledatalabsService {
  private apiKey;
  private api;
  private loggerContext = 'Peopledatalabs';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.people-finder.peopledatalabsApiKey'
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
  }: SearchPeopleByDomainReqDto): Promise<SearchPeopleArrayResDto> {
    return new Promise(resolve => {
      const esQuery = {
        query: {
          bool: {
            must: [
              {term: {full_name: name}},
              {term: {job_company_website: companyDomain}},
            ],
          },
        },
      };
      const params = {
        searchQuery: esQuery,
        size: 1,
        pretty: true,
      };
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
          const resError = {error};
          resolve({error: resError});
          this.logger.error(
            'Peopledatalabs searchPeopleByDomain error: ' +
              JSON.stringify(resError),
            this.loggerContext
          );
        });
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
          const resError = {error};
          resolve({error: resError});
          this.logger.error(
            'Peopledatalabs searchPeopleByLinkedin error: ' +
              JSON.stringify(resError),
            this.loggerContext
          );
        });
    });
  }
}
