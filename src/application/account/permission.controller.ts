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
import {
  Permission,
  PermissionAction,
  Prisma,
  TrustedEntityType,
} from '@prisma/client';
import {PermissionService} from '../../microservices/account/permission/permission.service';

@ApiTags('Account / Permission')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get('resources')
  listPermissionResources() {
    return Object.values(Prisma.ModelName);
  }

  @Get('actions')
  listPermissionActions() {
    return Object.values(PermissionAction);
  }

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          resource: Prisma.ModelName.UserProfile,
          action: PermissionAction.Get,
          where: {state: {in: ['StateA', 'StateB']}},
          trustedEntityType: TrustedEntityType.USER,
          trustedEntityId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async createPermission(
    @Body() body: Prisma.PermissionCreateInput
  ): Promise<Permission> {
    return await this.permissionService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'resource', type: 'string'})
  async getPermissions(
    @Query('resource') resource?: string
  ): Promise<Permission[]> {
    // [step 1] Construct where argument.
    let where: Prisma.PermissionWhereInput | undefined;
    const whereConditions: object[] = [];
    if (resource) {
      resource = resource.trim();
      if (resource.length > 0) {
        whereConditions.push({resource: {search: resource}});
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Get permissions.
    return await this.permissionService.findMany({where: where});
  }

  @Get(':permissionId')
  @ApiParam({
    name: 'permissionId',
    schema: {type: 'number'},
    description: 'The id of the permission.',
    example: 1,
  })
  async getPermission(
    @Param('permissionId') permissionId: number
  ): Promise<Permission | null> {
    return await this.permissionService.findUnique({
      where: {id: permissionId},
    });
  }

  @Patch(':permissionId')
  @ApiParam({
    name: 'permissionId',
    schema: {type: 'number'},
    description: 'The id of the permission.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          resource: Prisma.ModelName.Role,
          action: PermissionAction.Update,
          trustedEntityType: TrustedEntityType.USER,
          trustedEntityId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async updatePermission(
    @Param('permissionId') permissionId: number,
    @Body()
    body: Prisma.PermissionUpdateInput
  ): Promise<Permission> {
    return await this.permissionService.update({
      where: {id: permissionId},
      data: body,
    });
  }

  @Delete(':permissionId')
  @ApiParam({
    name: 'permissionId',
    schema: {type: 'number'},
    example: 1,
  })
  async deletePermission(
    @Param('permissionId') permissionId: number
  ): Promise<Permission> {
    return await this.permissionService.delete({
      where: {id: permissionId},
    });
  }

  /* End */
}
