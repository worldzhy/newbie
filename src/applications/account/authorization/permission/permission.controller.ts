import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  Permission,
  PermissionAction,
  PermissionResource,
  Prisma,
  TrustedEntityType,
} from '@prisma/client';
import {PermissionService} from './permission.service';

@ApiTags('[Application] Account / Permission')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get('resources')
  async listPermissionResources() {
    return Object.values(PermissionResource);
  }

  @Get('acctions')
  async listEnvironmentEnvironments() {
    return Object.values(PermissionAction);
  }

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          resource: PermissionResource.Role,
          action: PermissionAction.CREATE,
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
  async getPermissions(): Promise<Permission[]> {
    return await this.permissionService.findMany({});
  }

  @Get(':permissionId')
  @ApiParam({
    name: 'permissionId',
    schema: {type: 'string'},
    description: 'The uuid of the permission.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getPermission(
    @Param('permissionId') permissionId: string
  ): Promise<Permission | null> {
    return await this.permissionService.findUnique({
      where: {id: permissionId},
    });
  }

  @Patch(':permissionId')
  @ApiParam({
    name: 'permissionId',
    schema: {type: 'string'},
    description: 'The uuid of the permission.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          resource: PermissionResource.Role,
          action: PermissionAction.UPDATE,
          trustedEntityType: TrustedEntityType.USER,
          trustedEntityId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async updatePermission(
    @Param('permissionId') permissionId: string,
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
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deletePermission(
    @Param('permissionId') permissionId: string
  ): Promise<Permission> {
    return await this.permissionService.delete({
      where: {id: permissionId},
    });
  }

  /* End */
}
