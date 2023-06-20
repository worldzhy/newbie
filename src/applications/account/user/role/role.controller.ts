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
import {Role, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../authorization/authorization.decorator';
import {RoleService} from './role.service';

@ApiTags('[Application] Account / Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  private roleService = new RoleService();

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Role)
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Admin',
        },
      },
    },
  })
  async createRole(
    @Body() body: Prisma.RoleUncheckedCreateInput
  ): Promise<Role> {
    return await this.roleService.create({
      data: body,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Role)
  async getRoles(): Promise<Role[]> {
    return await this.roleService.findMany({});
  }

  @Get(':roleId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Role)
  @ApiParam({
    name: 'roleId',
    schema: {type: 'string'},
    description: 'The uuid of the role.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getRole(@Param('roleId') roleId: string): Promise<Role | null> {
    return await this.roleService.findUnique({
      where: {id: roleId},
    });
  }

  @Patch(':roleId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Role)
  @ApiParam({
    name: 'roleId',
    schema: {type: 'string'},
    description: 'The uuid of the role.',
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
  async updateRole(
    @Param('roleId') roleId: string,
    @Body()
    body: Prisma.RoleUpdateInput
  ): Promise<Role> {
    return await this.roleService.update({
      where: {id: roleId},
      data: body,
    });
  }

  @Delete(':roleId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Role)
  @ApiParam({
    name: 'roleId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteRole(@Param('roleId') roleId: string): Promise<Role> {
    return await this.roleService.delete({
      where: {id: roleId},
    });
  }

  /* End */
}
