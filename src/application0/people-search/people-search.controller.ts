import {Controller, Post, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {Prisma} from '@prisma/client';
import {ContactSearchReqDto, ContactSearchPeopleDto} from './people-search.dto';
import {PeopleSearchPlatforms, PeopleSearchStatus} from './constants';
import {
  VoilaNorbertService,
  SearchEmailThirdResDto,
  SearchEmailContentResDto,
} from '@microservices/cloud/saas/voila-norbert/volia-norbert.service';
import {ProxycurlService} from '@microservices/cloud/saas/proxycurl/proxycurl.service';
import {PeopledatalabsService} from '@microservices/cloud/saas/peopledatalabs/peopledatalabs.service';

@ApiTags('People-search')
@ApiBearerAuth()
@Controller('people-search')
export class PeopleSearchController {
  private loggerContext = 'PeopleSearch';
  selfDomain;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
    private readonly prisma: PrismaService,
    private readonly voilaNorbertService: VoilaNorbertService,
    private readonly proxycurlService: ProxycurlService,
    private readonly peopledatalabsService: PeopledatalabsService
  ) {
    this.selfDomain = this.configService.getOrThrow<string>(
      'microservice.people-finder.voilanorbertCallback'
    );
  }

  getCommonContactSearch = (user: ContactSearchPeopleDto) => {
    return {
      userId: user.userId,
      userSource: user.userSource,
      name: user.name,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      linkedin: user.linkedin,
    };
  };

  platformSearch = {
    /**
     * voilanorbert
     */
    [PeopleSearchPlatforms.voilanorbert]: async (
      user: ContactSearchPeopleDto
    ) => {
      const {name, companyDomain} = user;
      if (!name || !companyDomain) return;
      const newRecord = await this.prisma.contactSearch.create({
        data: {
          ...this.getCommonContactSearch(user),
          source: PeopleSearchPlatforms.voilanorbert,
          sourceMode: 'searchEmailByDomain',
          status: PeopleSearchStatus.pending,
        },
      });
      // todo spent
      const {res, error} = await this.voilaNorbertService.searchEmailByDomain({
        name,
        companyDomain,
        webhook:
          this.selfDomain +
          '/people-search/voilanorbert-hook?contactSearchId=' +
          newRecord.id, // todo
      });
      await this.voilanorbertContactSearchCallback(newRecord.id, res, error);
    },
    /**
     * proxycurl
     */
    [PeopleSearchPlatforms.proxycurl]: async (user: ContactSearchPeopleDto) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleSearchPlatforms.proxycurl,
            status: PeopleSearchStatus.pending,
          },
        });
        const {res, error, spent} =
          await this.proxycurlService.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.emails = JSON.stringify(res.personal_emails);
          updateData.phones = JSON.stringify(res.personal_numbers);
          updateData.status = PeopleSearchStatus.completed;
          updateData.ctx = JSON.stringify(res);
        }
        updateData.spent = spent;
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      }
    },
    /**
     * peopledatalabs
     */
    [PeopleSearchPlatforms.peopledatalabs]: async (
      user: ContactSearchPeopleDto
    ) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleSearchPlatforms.peopledatalabs,
            status: PeopleSearchStatus.pending,
          },
        });
        const {error, res} =
          await this.peopledatalabsService.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          if (res.data) {
            updateData.emails = JSON.stringify(res.data.emails);
            updateData.phones = JSON.stringify(
              res.data.mobile_phone ? [res.data.mobile_phone] : []
            );
            updateData.status = PeopleSearchStatus.completed;
            updateData.ctx = JSON.stringify(res);
          } else {
            updateData.status = PeopleSearchStatus.failed;
            updateData.ctx = JSON.stringify({
              msg: 'No data records were found for this person',
              res,
            });
          }
        }
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      } else if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByDomain',
            source: PeopleSearchPlatforms.peopledatalabs,
            status: PeopleSearchStatus.pending,
          },
        });
        const {error, res} =
          await this.peopledatalabsService.searchPeopleByDomain({
            companyDomain: user.companyDomain,
            name: user.name,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          const dataArray = res.data;
          if (dataArray.length) {
            updateData.emails = JSON.stringify(dataArray[0].emails);
            updateData.phones = JSON.stringify(
              dataArray[0].mobile_phone ? [dataArray[0].mobile_phone] : []
            );
            updateData.status = PeopleSearchStatus.completed;
            updateData.ctx = JSON.stringify(res);
          } else if (!dataArray || !dataArray.length) {
            updateData.status = PeopleSearchStatus.failed;
            updateData.ctx = JSON.stringify({
              msg: 'No data records were found for this person',
              res,
            });
          }
        }
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      }
    },
  };

  @NoGuard()
  @Post('contact-search')
  @ApiBody({
    description: '',
  })
  async contactSearch(
    @Body()
    body: ContactSearchReqDto
  ) {
    const {platforms, peoples} = body;
    for (let i = 0; i < peoples.length; i++) {
      const people = peoples[i];
      for (let platI = 0; platI < platforms.length; platI++) {
        const platform = platforms[platI];
        // todo: [throttle] Check if the current people has records on the current platform and filter out peoples with records
        await this.platformSearch[platform](people);
      }
    }
    return 'ok';
    // return await this.voilaNorbertService;
  }

  /**
   * This is the interface for callback of third-party services
   */
  @Post('voilanorbert-hook')
  async voilanorbertHook(
    @Query()
    contactSearchId: number,
    @Body()
    res: SearchEmailThirdResDto
  ) {
    await this.voilanorbertContactSearchCallback(
      Number(contactSearchId),
      res.data
    );
    this.logger.log(
      'voilanorbert-hook:' + contactSearchId + ' [res.data]:' + res.data,
      this.loggerContext
    );
    return 'ok';
  }

  async voilanorbertContactSearchCallback(
    contactSearchId: number,
    data?: SearchEmailContentResDto,
    error?: object
  ) {
    const updateData: Prisma.ContactSearchUpdateInput = {};
    if (error) {
      updateData.status = PeopleSearchStatus.failed;
      updateData.ctx = JSON.stringify(error);
    } else if (data) {
      if (!data.searching) {
        updateData.emails = JSON.stringify(data.email ? [data.email] : []);
        updateData.status = PeopleSearchStatus.completed;
      }
      updateData.ctx = JSON.stringify(data);
    }
    await this.prisma.contactSearch.update({
      where: {id: contactSearchId},
      data: updateData,
    });
  }

  /* End */
}
