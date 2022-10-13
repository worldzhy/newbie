import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Organization, Prisma} from '@prisma/client';
import {OrganizationService} from './organization.service';

@ApiTags('[Application] Account / Organization')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post('')
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
  async createOrganization(
    @Body() body: Prisma.OrganizationCreateInput
  ): Promise<Organization> {
    return await this.organizationService.create({
      data: body,
    });
  }

  @Get('')
  @ApiParam({
    required: false,
    name: 'name',
    description: 'The string you want to search in the organization pool.',
    example: 'jack',
    schema: {type: 'string'},
  })
  @ApiParam({
    required: false,
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the organization list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getOrganizations(
    @Query() query: {name?: string; page?: string}
  ): Promise<Organization[]> {
    // [step 1] Construct where argument.
    let where: Prisma.OrganizationWhereInput | undefined;
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        where = {name: {search: name}};
      }
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      if (page > 0) {
        take = 10;
        skip = 10 * (page - 1);
      } else {
        throw new BadRequestException('The page must be larger than 0.');
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get organizations.
    return await this.organizationService.findMany({
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
      },
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':organizationId')
  @ApiParam({
    name: 'organizationId',
    schema: {type: 'string'},
    description: 'The uuid of the organization.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getOrganization(
    @Param('organizationId') organizationId: string
  ): Promise<Organization | null> {
    return await this.organizationService.findUnique({
      where: {id: organizationId},
    });
  }

  @Patch(':organizationId')
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
  ): Promise<Organization> {
    return await this.organizationService.update({
      where: {id: organizationId},
      data: body,
    });
  }

  @Delete(':organizationId')
  @ApiParam({
    name: 'organizationId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteOrganization(
    @Param('organizationId') organizationId: string
  ): Promise<Organization> {
    return await this.organizationService.delete({
      where: {id: organizationId},
    });
  }

  /* End */
}
