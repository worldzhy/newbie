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
import {Role, Prisma, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../authorization/authorization.decorator';
import {RoleService} from './role.service';

@ApiTags('[Application] Account / Organization / Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  private roleService = new RoleService();

  @Post('')
  @RequirePermission('Role', PermissionAction.CREATE)
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
  async createRole(@Body() body: Prisma.RoleCreateInput): Promise<Role> {
    return await this.roleService.create({
      data: body,
    });
  }

  @Get('')
  @RequirePermission('Role', PermissionAction.SELECT)
  @ApiParam({
    required: false,
    name: 'name',
    description: 'The string you want to search in the role pool.',
    example: 'jack',
    schema: {type: 'string'},
  })
  @ApiParam({
    required: false,
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the role list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getRoles(
    @Query() query: {name?: string; page?: string}
  ): Promise<Role[]> {
    // [step 1] Construct where argument.
    let where: Prisma.RoleWhereInput | undefined;
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

    // [step 3] Get roles.
    return await this.roleService.findMany({
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

  @Get(':roleId')
  @RequirePermission('Role', PermissionAction.SELECT)
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
  @RequirePermission('Role', PermissionAction.UPDATE)
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
  @RequirePermission('Role', PermissionAction.DELETE)
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
