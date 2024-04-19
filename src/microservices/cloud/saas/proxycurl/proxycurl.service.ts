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
      'microservice.proxycurl.apiKey'
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
    domain,
    lastName,
    location,
  }: SearchPeopleLinkedinReqDto): Promise<SearchPeopleLinkedinResDto> {
    return new Promise(resolve => {
      this.api.personLookupEndpoint(
        domain,
        firstName,
        {
          location,
          // title
          lastName,
        },
        (error, data, response) => {
          // data {url:string}
          if (error) {
            const resError = {error};
            resolve({error: resError});
            this.logger.error(
              'Proxycurl searchPeopleLinkedin error: ' +
                JSON.stringify(resError),
              this.loggerContext
            );
          } else {
            // response.body has more details
            resolve({res: response.body});
            this.logger.error(
              'Proxycurl searchPeopleLinkedin success: ' +
                JSON.stringify(response.body),
              this.loggerContext
            );
          }
        }
      );
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
      this.api.personProfileEndpoint(
        linkedinUrl,
        'on-error',
        {
          // Costs an extra `1` credit per email returned on top of the cost of the base endpoint (if data is available).
          personalEmail,
          // Costs an extra `1` credit per number returned on top of the cost of the base endpoint (if data is available).
          personalContactNumber,
        },
        (error, data: SearchPeopleByLinkedinRes) => {
          if (error) {
            const resError = {error};
            resolve({error: resError});
            console.log(
              'Proxycurl searchPeopleByLinkedin error: ' +
                JSON.stringify(resError)
            );
          } else {
            resolve({res: data});
            console.log(
              'Proxycurl searchPeopleByLinkedin success: ' +
                JSON.stringify(data)
            );
          }
        }
      );
    });
  }
}
