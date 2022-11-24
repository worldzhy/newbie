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
import {PermissionService} from './permission.service';

@ApiTags('[Application] Account / Authorization / Permission')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  private permissionService = new PermissionService();

  @Get('resources')
  listPermissionResources() {
    return Object.values(Prisma.ModelName);
  }

  @Get('acctions')
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
          resource: Prisma.ModelName.JobApplication,
          action: PermissionAction.read,
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
    @Query() query: {resource?: string}
  ): Promise<Permission[]> {
    // [step 1] Construct where argument.
    let where: Prisma.PermissionWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.resource) {
      const resource = query.resource.trim();
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
    schema: {type: 'string'},
    description: 'The uuid of the permission.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getPermission(
    @Param('permissionId') permissionId: string
  ): Promise<Permission | null> {
    return await this.permissionService.findUnique({
      where: {id: parseInt(permissionId)},
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
          resource: Prisma.ModelName.Role,
          action: PermissionAction.update,
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
      where: {id: parseInt(permissionId)},
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
      where: {id: parseInt(permissionId)},
    });
  }

  /* End */
}
