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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Organization, PermissionAction, Prisma} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {OrganizationService} from '@microservices/account/organization/organization.service';

@ApiTags('Account / Organization')
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
  async getOrganizations(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.OrganizationWhereInput | undefined;
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        where = {name: {search: name}};
      }
    }

    // [step 2] Get organizations.
    return await this.organizationService.findManyInManyPages(
      {page, pageSize},
      {
        orderBy: {
          _relevance: {
            fields: ['name'],
            search: 'database',
            sort: 'asc',
          },
        },
        where: where,
      }
    );
  }

  @Get(':organizationId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Organization)
  async getOrganization(
    @Param('organizationId') organizationId: string
  ): Promise<Organization> {
    return await this.organizationService.findUniqueOrThrow({
      where: {id: organizationId},
    });
  }

  @Patch(':organizationId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Organization)
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
  async deleteOrganization(
    @Param('organizationId') organizationId: string
  ): Promise<Organization> {
    return await this.organizationService.delete({
      where: {id: organizationId},
    });
  }

  /* End */
}
