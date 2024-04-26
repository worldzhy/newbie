import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import * as ProxycurlApi from 'proxycurl-js-linkedin-profile-scraper';
import {
  SearchPeopleLinkedinReqDto,
  SearchPeopleByLinkedinRes,
  SearchPeopleByLinkedinResDto,
  SearchPeopleLinkedinResDto,
  SearchPeopleByLinkedinReqDto,
} from './proxycurl.dto';

@Injectable()
export class ProxycurlService {
  private apiKey;
  private api;
  private loggerContext = 'Proxycurl';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.proxycurl.apiKey'
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
            if (response.header['x-proxycurl-credit-cost']) {
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
}
