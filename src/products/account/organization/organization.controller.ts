import {Controller, Get, Post, Param, Body, Put} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {OrganizationService} from './organization.service';

@ApiTags('[Product] Account / Organization')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get('/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the organization list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getOrganizationsByPage(@Param('page') page: number) {
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
    return await this.organizationService.findMany({
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
      },
    });
  }

  @Get('/:organizationId')
  @ApiParam({
    name: 'organizationId',
    schema: {type: 'string'},
    description: 'The uuid of the organization.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getOrganization(@Param('organizationId') organizationId: string) {
    return await this.organizationService.findUnique({
      where: {id: organizationId},
    });
  }

  @Post('/')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async createOrganization(@Body() body: Prisma.OrganizationCreateInput) {
    return await this.organizationService.create({
      data: body,
    });
  }

  @Put('/:organizationId')
  @ApiParam({
    name: 'organizationId',
    schema: {type: 'string'},
    description: 'The uuid of the organization.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async updateOrganization(
    @Param('organizationId') organizationId: string,
    @Body()
    body: Prisma.OrganizationUpdateInput
  ) {
    return await this.organizationService.update({
      where: {id: organizationId},
      data: body,
    });
  }

  /* End */
}
