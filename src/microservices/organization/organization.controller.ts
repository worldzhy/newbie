import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {Organization, PermissionAction, Prisma} from '@prisma/client';
import {RequirePermission} from '../../application/account/authorization/authorization.decorator';
import {OrganizationService} from './organization.service';
import {generatePaginationParams} from '../../toolkit/pagination/pagination';

@ApiTags('[Microservice] Organization')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Organization)
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
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Organization)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getOrganizations(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<Organization[]> {
    // [step 1] Construct where argument.
    let where: Prisma.OrganizationWhereInput | undefined;
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        where = {name: {search: name}};
      }
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

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
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Organization)
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
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Organization)
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
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Organization)
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
