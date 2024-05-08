import {Injectable} from '@nestjs/common';
import {
  VoilaNorbertService,
  SearchEmailContentResDto,
} from './voila-norbert/volia-norbert.service';
import {ProxycurlService} from './proxycurl/proxycurl.service';
import {PeopledatalabsService} from './peopledatalabs/peopledatalabs.service';
import {Prisma} from '@prisma/client';
import {ContactSearchPeopleDto} from './people-finder.dto';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  SearchFilter,
} from './constants';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  constructor(
    public readonly voilaNorbert: VoilaNorbertService,
    public readonly proxycurl: ProxycurlService,
    public readonly peopledatalabs: PeopledatalabsService,
    private readonly prisma: PrismaService
  ) {}

  async isExist({
    platform,
    userSource,
    userId,
  }: {
    platform: PeopleFinderPlatforms;
    userSource: string;
    userId: string;
  }): Promise<boolean> {
    const res = await this.prisma.contactSearch.findFirst({
      where: {
        status: {
          notIn: [
            PeopleFinderStatus.deleted,
            PeopleFinderStatus.parameterError,
          ],
        },
        source: platform,
        userSource,
        userId,
      },
    });
    if (res) return true;
    return false;
  }

  /**
   * voilanorbert [support: email]
   * @param webhook: xxxx.com?id=
   */
  async voilanorbertFind(user: ContactSearchPeopleDto, webhook: string) {
    const {name, companyDomain} = user;
    if (!name || !companyDomain) return;
    const newRecord = await this.prisma.contactSearch.create({
      data: {
        ...user,
        source: PeopleFinderPlatforms.voilanorbert,
        sourceMode: 'searchEmailByDomain',
        status: PeopleFinderStatus.pending,
      },
    });
    // todo spent
    const {res, error} = await this.voilaNorbert.searchEmailByDomain({
      name,
      companyDomain,
      webhook: webhook + newRecord.id,
    });
    return await this.voilanorbertContactSearchCallback(
      newRecord.id,
      res,
      error
    );
  }
  async voilanorbertContactSearchCallback(
    id: number,
    data?: SearchEmailContentResDto,
    error?: object
  ) {
    const dataFlag = {
      email: false,
    };
    const updateData: Prisma.ContactSearchUpdateInput = {};
    if (error) {
      updateData.status = PeopleFinderStatus.failed;
      updateData.ctx = error;
    } else if (data) {
      if (!data.searching) {
        updateData.emails = data.email ? [data.email as object] : [];
        updateData.status = PeopleFinderStatus.completed;

        if (updateData.emails && updateData.emails.length)
          dataFlag.email = true;
      }
      updateData.ctx = data as object;
    }
    await this.prisma.contactSearch.update({
      where: {id},
      data: updateData,
    });
    return {error, res: data, dataFlag};
  }
  /**
   * proxycurl [support: email,phone]
   */
  async proxycurlFind(
    user: ContactSearchPeopleDto,
    {phone, email}: SearchFilter
  ) {
    const dataFlag = {
      email: false,
      phone: false,
    };
    if (user.linkedin) {
      const newRecord = await this.prisma.contactSearch.create({
        data: {
          ...user,
          sourceMode: 'searchPeopleByLinkedin',
          source: PeopleFinderPlatforms.proxycurl,
          status: PeopleFinderStatus.pending,
        },
      });
      const {res, error, spent} = await this.proxycurl.searchPeopleByLinkedin({
        linkedinUrl: user.linkedin,
        personalEmail: email ? 'include' : 'exclude',
        personalContactNumber: phone ? 'include' : 'exclude',
      });
      const updateData: Prisma.ContactSearchUpdateInput = {};

      if (error) {
        updateData.status = PeopleFinderStatus.failed;
        updateData.ctx = error as object;
      } else if (res) {
        updateData.emails = res.personal_emails;
        updateData.phones = res.personal_numbers;

        if (updateData.emails && updateData.emails.length)
          dataFlag.email = true;

        if (updateData.phones && updateData.phones.length)
          dataFlag.phone = true;

        updateData.status = PeopleFinderStatus.completed;
        updateData.ctx = res as object;
      }
      updateData.spent = spent;

      await this.prisma.contactSearch.update({
        where: {id: newRecord.id},
        data: updateData,
      });

      return {res, error, dataFlag};
    } else if (user.companyDomain && user.firstName) {
      const newRecord = await this.prisma.contactSearch.create({
        data: {
          ...user,
          sourceMode: 'searchPeopleLinkedin',
          source: PeopleFinderPlatforms.proxycurl,
          status: PeopleFinderStatus.pending,
        },
      });

      const {res, error, spent} = await this.proxycurl.searchPeopleLinkedin({
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
        return await this.proxycurlFind(
          {
            ...user,
            linkedin: res.url,
          },
          {phone, email}
        );
      }
      return {res, error, dataFlag};
    }
  }
  /**
   * peopledatalabs [support: email,phone]
   */
  async peopledatalabsFind(
    mode: 'byLinkedin' | 'byDomain',
    user: ContactSearchPeopleDto,
    {phone, email}: SearchFilter
  ) {
    const dataFlag = {
      email: false,
      phone: false,
    };
    if (mode === 'byLinkedin') {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...user,
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} = await this.peopledatalabs.searchPeopleByLinkedin({
          linkedinUrl: user.linkedin,
        });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          if (res.data) {
            updateData.emails = res.data.emails as object[];
            updateData.phones = res.data.phone_numbers
              ? res.data.phone_numbers
              : [];

            if (updateData.emails && updateData.emails.length)
              dataFlag.email = true;

            if (updateData.phones && updateData.phones.length)
              dataFlag.phone = true;

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
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        return {error, res, dataFlag};
      } else {
        await this.prisma.contactSearch.create({
          data: {
            ...user,
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.parameterError,
          },
        });
        return {error: {error: 'Missing parameters'}, dataFlag};
      }

      // If not found, use domain query
      // if (
      //   !res ||
      //   ((!res.data.emails || !res.data.emails.length) &&
      //     (!res.data.phone_numbers || !res.data.phone_numbers.length))
      // ) {
      //   await this.peopledatalabs.searchPeopleByDomain({
      //     companyDomain: user.companyDomain,
      //     name: user.name,
      //     phone,
      //     email,
      //   });
      // }
    }
    if (mode === 'byDomain') {
      if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...user,
            sourceMode: 'searchPeopleByDomain',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} = await this.peopledatalabs.searchPeopleByDomain({
          companyDomain: user.companyDomain,
          name: user.name,
          phone,
          email,
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
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
        return {error, res, dataFlag};
      } else {
        await this.prisma.contactSearch.create({
          data: {
            ...user,
            sourceMode: 'searchPeopleByDomain',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.parameterError,
          },
        });
        return {error: {error: 'Missing parameters'}, dataFlag};
      }
    }
  }
}
