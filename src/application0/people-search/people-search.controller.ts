import {Controller, Post, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {ContactSearchReqDto, ContactSearchUserDto} from './people-search.dto';
import {PeopleSearchPlatforms, PeopleSearchStatus} from './constants';
import {
  VoilaNorbertService,
  SearchEmailThirdResDto,
} from '@microservices/cloud/saas/voila-norbert/volia-norbert.service';
import {ProxycurlService} from '@microservices/cloud/saas/proxycurl/proxycurl.service';
import {PeopledatalabsService} from '@microservices/cloud/saas/peopledatalabs/peopledatalabs.service';

@ApiTags('People-search')
@ApiBearerAuth()
@Controller('people-search')
export class PeopleSearchController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voilaNorbertService: VoilaNorbertService,
    private readonly proxycurlService: ProxycurlService,
    private readonly peopledatalabsService: PeopledatalabsService
  ) {}

  getCommonContactSearch = (user: ContactSearchUserDto) => {
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
      user: ContactSearchUserDto
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
      const {res, error} = await this.voilaNorbertService.searchEmailByDomain({
        name,
        companyDomain,
        webhook: 'voilanorbert-hook?contactSearchId=' + newRecord.id, // todo
      });
      await this.voilanorbertContactSearchCallback(newRecord.id, res, error);
    },
    /**
     * proxycurl
     */
    [PeopleSearchPlatforms.proxycurl]: async (user: ContactSearchUserDto) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchUserByLinkedin',
            source: PeopleSearchPlatforms.proxycurl,
            status: PeopleSearchStatus.pending,
          },
        });
        const {res, error} = await this.proxycurlService.searchUserByLinkedin({
          linkedinUrl: user.linkedin,
        });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.emails = JSON.stringify(res.personalEmails);
          updateData.phones = JSON.stringify(res.personalNumbers);
          updateData.status = PeopleSearchStatus.completed;
          updateData.ctx = JSON.stringify(res);
        }
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
      user: ContactSearchUserDto
    ) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchUserByLinkedin',
            source: PeopleSearchPlatforms.peopledatalabs,
            status: PeopleSearchStatus.pending,
          },
        });
        const {error, res} =
          await this.peopledatalabsService.searchUserByLinkedin({
            linkedinUrl: user.linkedin,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.emails = JSON.stringify(res.emails);
          updateData.phones = JSON.stringify([res.mobile_phone]);
          updateData.status = PeopleSearchStatus.completed;
          updateData.ctx = JSON.stringify(res);
        }
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      } else if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchUserByDomain',
            source: PeopleSearchPlatforms.peopledatalabs,
            status: PeopleSearchStatus.pending,
          },
        });
        const {error, res} =
          await this.peopledatalabsService.searchUserByDomain({
            companyDomain: user.companyDomain,
            name: user.name,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleSearchStatus.failed;
          updateData.ctx = JSON.stringify(error);
        } else if (res) {
          updateData.emails = JSON.stringify(res.emails);
          updateData.phones = JSON.stringify([res.mobile_phone]);
          updateData.status = PeopleSearchStatus.completed;
          updateData.ctx = JSON.stringify(res);
        }
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      }
    },
  };

  @Post('contact-search')
  @ApiBody({
    description: '',
  })
  async contactSearch(
    @Body()
    body: ContactSearchReqDto
  ) {
    const {platforms, users} = body;
    for (let i = 0; i < users.length; i++) {
      for (let platI = 0; platI < platforms.length; platI++) {
        const platform = platforms[platI];
        const user = users[i];
        // todo: [throttle] Check if the current user has records on the current platform and filter out users with records
        await this.platformSearch[platform](user);
      }
    }
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
    await this.voilanorbertContactSearchCallback(Number(contactSearchId), res);
    console.log('voilanorbert-hook:', contactSearchId, ' res:', res);
  }

  async voilanorbertContactSearchCallback(
    contactSearchId: number,
    res?: SearchEmailThirdResDto,
    error?: object
  ) {
    const updateData: Prisma.ContactSearchUpdateInput = {};
    if (error) {
      updateData.status = PeopleSearchStatus.failed;
      updateData.ctx = JSON.stringify(error);
    } else if (res) {
      if (res.status === 200) {
        if (res.data.searching) {
          updateData.emails = JSON.stringify([res.data.email]);
          updateData.status = PeopleSearchStatus.completed;
        }
      } else {
        updateData.status = PeopleSearchStatus.failed;
      }
      updateData.ctx = JSON.stringify(res);
    }
    await this.prisma.contactSearch.update({
      where: {id: contactSearchId},
      data: updateData,
    });
  }

  /* End */
}
