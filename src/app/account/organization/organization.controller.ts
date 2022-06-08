import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {OrganizationService} from './organization.service';

@ApiTags('Account - Organization')
@ApiBearerAuth()
@Controller()
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  /**
   * Get organizations by searching name.
   *
   * @param {string} search
   * @param {number} page
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof OrganizationController
   */
  @Get('organizations/search/:search/pages/:page')
  @ApiParam({
    name: 'search',
    description: 'The string you want to search in the organization pool.',
    example: 'jack',
    schema: {type: 'string'},
  })
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the organization list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getOrganizationsBySearch(
    @Param('search') search: string,
    @Param('page') page: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    const s = search.trim();
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (s.length < 1 || p < 1) {
      return {
        data: null,
        err: {
          message:
            "The 'str' length and 'page' must be larger than 0 integers.",
        },
      };
    }

    // [step 2] Search organizationname, given name, family name...
    const organizations = await this.organizationService.findMany({
      where: {
        OR: [
          {name: {search: s}},
          {
            profile: {
              is: {
                OR: [
                  {givenName: {search: s}},
                  {familyName: {search: s}},
                  {middleName: {search: s}},
                  {name: {search: s}},
                ],
              },
            },
          },
        ],
      },
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
      select: {
        id: true,
        name: true,
        profile: true,
      },
    });
    return {
      data: organizations,
      err: null,
    };
  }

  /**
   * Get organizations by page number. The order is by organizationname.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof OrganizationController
   */
  @Get('organizations/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the organization list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getOrganizationsByPage(
    @Param('page') page: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (p < 1) {
      return {
        data: null,
        err: {message: "The 'page' must be a large than 0 integer."},
      };
    }

    // [step 2] Get organizations.
    const organizations = await this.organizationService.findMany({
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
      select: {
        id: true,
        name: true,
        profile: true,
      },
    });
    return {
      data: organizations,
      err: null,
    };
  }

  /**
   * Get organization by id
   *
   * @param {string} organizationId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof OrganizationController
   */
  @Get('organizations/:organizationId')
  @ApiParam({
    name: 'organizationId',
    schema: {type: 'string'},
    description: 'The uuid of the organization.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getOrganization(
    @Param('organizationId') organizationId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.organizationService.findOne({id: organizationId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get organization failed.'},
      };
    }
  }

  @Post('organizations')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'InceptionPad Inc',
        },
      },
      b: {
        summary: '1. Update',
        value: {
          id: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async postOrganization(
    @Body()
    body: Prisma.OrganizationCreateInput | Prisma.OrganizationCreateInput
  ) {
    // [step 1] Guard statement.

    // [step 2] Create or modify profile.
    if (body.id) {
      const result = await this.organizationService.update({
        where: {id: body.id},
        data: body,
      });
      if (result) {
        return {
          data: result,
          err: null,
        };
      } else {
        return {
          data: null,
          err: {message: 'Update organization failed.'},
        };
      }
    } else {
      const result = await this.organizationService.create(body);
      if (result) {
        return {
          data: result,
          err: null,
        };
      } else {
        return {
          data: null,
          err: {message: 'Create organization failed.'},
        };
      }
    }
  }

  /* End */
}
