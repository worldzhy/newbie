import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as ProxycurlApi from 'proxycurl-js-linkedin-profile-scraper';
import {
  SearchUserLinkedinReqDto,
  SearchUserByLinkedinResDto,
  SearchUserLinkedinResDto,
  SearchUserByLinkedinReqDto,
} from './proxycurl.dto';

@Injectable()
export class ProxycurlService {
  private apiKey;
  private api;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.proxycurl.apiKey'
    );
    const defaultClient = ProxycurlApi.ApiClient.instance;
    // Configure Bearer access token for authorization: BearerAuth
    const BearerAuth = defaultClient.authentications['BearerAuth'];
    BearerAuth.accessToken = this.apiKey;
    this.api = new ProxycurlApi.PeopleAPIApi();

    // this.searchUserLinkedin({
    //   firstName: 'yiwen',
    //   domain: 'inceptionpad.com',
    // });
    // this.searchUserByLinkedin({
    //   linkedinUrl: 'https://www.linkedin.com/in/yiwen-mu',
    // });
  }

  /**
   * https://github.com/nubelaco/proxycurl-js-linkedin-profile-scraper/blob/main/docs/PeopleAPIApi.md
   * 1 credit
   */
  async searchUserLinkedin({
    firstName,
    domain,
    lastName,
    location,
  }: SearchUserLinkedinReqDto): Promise<SearchUserLinkedinResDto> {
    return new Promise((resolve, reject) => {
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
            reject(error);
          } else {
            // response.body has more details
            resolve(response.body);
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
  async searchUserByLinkedin({
    linkedinUrl,
    personalEmail,
    personalContactNumber,
  }: SearchUserByLinkedinReqDto): Promise<SearchUserByLinkedinResDto> {
    return new Promise((resolve, reject) => {
      this.api.personProfileEndpoint(
        linkedinUrl,
        'on-error',
        {
          // Costs an extra `1` credit per email returned on top of the cost of the base endpoint (if data is available).
          personalEmail,
          // Costs an extra `1` credit per number returned on top of the cost of the base endpoint (if data is available).
          personalContactNumber,
        },
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
            console.log('API called successfully. Returned data: ' + data);
          }
        }
      );
    });
  }
}
