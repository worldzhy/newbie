import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  SearchEmailByDomainReqDto,
  SearchEmailResDto,
  SearchEmailThirdResDto,
} from './volia-norbert.dto';
export * from './volia-norbert.dto';

const baseUrl = 'https://api.voilanorbert.com/2018-01-08';
@Injectable()
export class VoilaNorbertService {
  private apiKey;
  private reqConfig;

  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.voilanorbert.apiKey'
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
      this.httpService.axiosRef
        .post<SearchEmailByDomainReqDto, SearchEmailThirdResDto>(
          url,
          data,
          this.reqConfig
        )
        .then(res => {
          resolve({res});
          console.log(
            'VoliaNorbert searchUserLinkedin success: ' + JSON.stringify(res)
          );
        })
        .catch(e => {
          const resError = {error: e};
          resolve({error: resError});
          console.log(
            'VoliaNorbert searchUserLinkedin error: ' + JSON.stringify(resError)
          );
        });
    });
  }

  // async verifyEmail({email, webhook}: {email: string; webhook: string}) {
  //   const url = `${baseUrl}/verifier/upload`;
  //   const data = {
  //     email,
  //     webhook,
  //   };

  //   const response = await this.httpService.axiosRef
  //     .post(url, data, this.reqConfig)
  //     .catch(err => {
  //       console.log(err);
  //     });
  //   if (response) return response.data;
  // }
}
