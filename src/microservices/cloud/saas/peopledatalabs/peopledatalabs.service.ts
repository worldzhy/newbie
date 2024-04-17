import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as PDLJS from 'peopledatalabs';
import {
  SearchUserByDomainReqDto,
  SearchUserResDto,
  SearchUserByLinkedinReqDto,
} from './peopledatalabs.dto';

@Injectable()
export class PeopledatalabsService {
  private apiKey;
  private api;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.peopledatalabs.apiKey'
    );
    // @ts-ignore
    this.api = new PDLJS({apiKey: this.apiKey});

    // this.searchUserByDomain({
    //   fullName: 'Jovan Bethell',
    //   domain: 'pioneerinterests.com',
    // });
    // this.searchUserByLinkedin({
    //   linkedinUrl: 'https://www.linkedin.com/in/yiwen-mu',
    // });
  }

  /**
   * rateLimitLimit:{minute: 10}
   * https://docs.peopledatalabs.com/docs/quickstart-person-enrichment-api
   * 1 credit
   */
  async searchUserByDomain({
    fullName,
    domain,
  }: SearchUserByDomainReqDto): Promise<SearchUserResDto> {
    return new Promise((resolve, reject) => {
      const esQuery = {
        query: {
          bool: {
            must: [
              {term: {full_name: fullName}},
              {term: {job_company_website: domain}},
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
        .then(data => {
          resolve(data.data);
        })
        .catch(error => {
          reject(error);
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
  async searchUserByLinkedin({
    linkedinUrl,
  }: SearchUserByLinkedinReqDto): Promise<SearchUserResDto> {
    return new Promise((resolve, reject) => {
      const params = {
        profile: linkedinUrl,
      };

      // Pass the parameters object to the Person Enrichment API
      this.api.person
        .enrichment(params)
        .then(jsonResponse => {
          resolve(jsonResponse.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
