import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  SearchNameByDomainReqDto,
  SearchNameHttpResDto,
} from './volia-norbert.dto';

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
    // this.searchNameByDomain({
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
  async searchNameByDomain({
    name,
    company,
    domain,
    // webhook,
    // list_id,
  }: SearchNameByDomainReqDto): Promise<SearchNameHttpResDto> {
    const url = `${baseUrl}/search/name`;
    const data = {
      name,
      company,
      domain,
    };
    return this.httpService.axiosRef.post(url, data, this.reqConfig);
  }

  async verifyEmail({email, webhook}: {email: string; webhook: string}) {
    const url = `${baseUrl}/verifier/upload`;
    const data = {
      email,
      webhook,
    };

    const response = await this.httpService.axiosRef
      .post(url, data, this.reqConfig)
      .catch(err => {
        console.log(err);
      });
    if (response) return response.data;
  }
}
