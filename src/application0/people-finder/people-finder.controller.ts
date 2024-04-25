import {Controller, Post, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {Prisma} from '@prisma/client';
import {ContactSearchReqDto, ContactSearchPeopleDto} from './people-finder.dto';
import {
  SearchEmailThirdResDto,
  SearchEmailContentResDto,
} from '@microservices/people-finder/voila-norbert/volia-norbert.service';

import {
  PeopleFinderService,
  PeopleFinderPlatforms,
  PeopleFinderStatus,
} from '@microservices/people-finder/people-finder.service';

@ApiTags('People-finder')
@ApiBearerAuth()
@Controller('people-finder')
export class PeopleFinderController {
  private loggerContext = 'PeopleFinder';
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly peopleFinder: PeopleFinderService,
    private readonly logger: CustomLoggerService,
    private readonly prisma: PrismaService
  ) {
    this.callBackOrigin = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.voilanorbert.callbackOrigin'
    );
  }

  getCommonContactSearch = (user: ContactSearchPeopleDto) => {
    return {
      userId: user.userId,
      userSource: user.userSource,
      name: user.name,
      companyDomain: user.companyDomain,
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
    [PeopleFinderPlatforms.voilanorbert]: async (
      user: ContactSearchPeopleDto
    ) => {
      const {name, companyDomain} = user;
      if (!name || !companyDomain) return;
      const newRecord = await this.prisma.contactSearch.create({
        data: {
          ...this.getCommonContactSearch(user),
          source: PeopleFinderPlatforms.voilanorbert,
          sourceMode: 'searchEmailByDomain',
          status: PeopleFinderStatus.pending,
        },
      });
      // todo spent
      const {res, error} =
        await this.peopleFinder.voilaNorbert.searchEmailByDomain({
          name,
          companyDomain,
          webhook:
            this.callBackOrigin +
            '/people-finder/voilanorbert-hook?contactSearchId=' +
            newRecord.id, // todo
        });
      return await this.voilanorbertContactSearchCallback(
        newRecord.id,
        res,
        error
      );
    },
    /**
     * proxycurl
     */
    [PeopleFinderPlatforms.proxycurl]: async (user: ContactSearchPeopleDto) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.proxycurl,
            status: PeopleFinderStatus.pending,
          },
        });
        const {res, error, spent} =
          await this.peopleFinder.proxycurl.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
            personalEmail: 'include',
            personalContactNumber: 'include',
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.emails = res.personal_emails;
          updateData.phones = res.personal_numbers;
          updateData.status = PeopleFinderStatus.completed;
          updateData.ctx = res as object;
        }
        updateData.spent = spent;
        return await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      } else if (user.companyDomain && user.firstName) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleLinkedin',
            source: PeopleFinderPlatforms.proxycurl,
            status: PeopleFinderStatus.pending,
          },
        });

        const {res, error, spent} =
          await this.peopleFinder.proxycurl.searchPeopleLinkedin({
            firstName: user.firstName,
            lastName: user.lastName,
            companyDomain: user.companyDomain,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};

        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res && res.url) {
          updateData.linkedin = res.url;
          updateData.status = PeopleFinderStatus.completed;
          updateData.ctx = res as object;
        } else {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = res as object;
        }
        updateData.spent = spent;

        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        if (res && res.url) {
          await this.platformSearch[PeopleFinderPlatforms.proxycurl]({
            ...user,
            linkedin: res.url,
          });
        }
      }
    },
    /**
     * peopledatalabs
     */
    [PeopleFinderPlatforms.peopledatalabs]: async (
      user: ContactSearchPeopleDto
    ) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} =
          await this.peopleFinder.peopledatalabs.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          if (res.data) {
            updateData.emails = res.data.emails as object;
            updateData.phones = res.data.phone_numbers
              ? res.data.phone_numbers
              : [];
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
        return await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      } else if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByDomain',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} =
          await this.peopleFinder.peopledatalabs.searchPeopleByDomain({
            companyDomain: user.companyDomain,
            name: user.name,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          const dataArray = res.data;
          if (dataArray.length) {
            updateData.emails = dataArray[0].emails as object;
            updateData.phones = dataArray[0].mobile_phone
              ? [dataArray[0].mobile_phone]
              : [];
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
        return await this.prisma.contactSearch.update({
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
  @NoGuard()
  @Post('voilanorbert-hook')
  async voilanorbertHook(
    @Query('contactSearchId')
    contactSearchId: number,
    @Body()
    res: SearchEmailThirdResDto['data']
  ) {
    await this.voilanorbertContactSearchCallback(Number(contactSearchId), res);
    this.logger.log(
      'voilanorbert-hook:' + contactSearchId + ' [res]:' + JSON.stringify(res),
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
      updateData.status = PeopleFinderStatus.failed;
      updateData.ctx = error;
    } else if (data) {
      if (!data.searching) {
        updateData.emails = data.email ? [data.email as object] : [];
        updateData.status = PeopleFinderStatus.completed;
      }
      updateData.ctx = data as object;
    }
    await this.prisma.contactSearch.update({
      where: {id: contactSearchId},
      data: updateData,
    });
  }

  /* End */
}
