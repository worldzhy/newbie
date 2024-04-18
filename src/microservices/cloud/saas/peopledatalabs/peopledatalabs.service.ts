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
    name,
    companyDomain,
  }: SearchUserByDomainReqDto): Promise<SearchUserResDto> {
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
        .then(data => {
          resolve({res: data.data});
          console.log(
            'Peopledatalabs searchUserByDomain success: ' +
              JSON.stringify(data.data)
          );
        })
        .catch(error => {
          const resError = {error};
          resolve({error: resError});
          console.log(
            'Peopledatalabs searchUserByDomain error: ' +
              JSON.stringify(resError)
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
  async searchUserByLinkedin({
    linkedinUrl,
  }: SearchUserByLinkedinReqDto): Promise<SearchUserResDto> {
    return new Promise(resolve => {
      const params = {
        profile: linkedinUrl,
      };

      // Pass the parameters object to the Person Enrichment API
      this.api.person
        .enrichment(params)
        .then(jsonResponse => {
          resolve({res: jsonResponse.data});
          console.log(
            'Peopledatalabs searchUserByLinkedin success: ' +
              JSON.stringify(jsonResponse.data)
          );
        })
        .catch(error => {
          const resError = {error};
          resolve({error: resError});
          console.log(
            'Peopledatalabs searchUserByLinkedin error: ' +
              JSON.stringify(resError)
          );
        });
    });
  }
}
