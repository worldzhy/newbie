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
import {Prisma, User} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {
  generatePaginationParams,
  generatePaginationResponse,
} from '@toolkit/pagination/pagination';

const ROLE_NAME_AREA_MANAGER = 'Area Manager';

@ApiTags('Area Manager')
@ApiBearerAuth()
@Controller('area-managers')
export class AreaManagerController {
  constructor(private userService: UserService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          email: '',
          phone: '',
          profile: {
            create: {
              firstName: '',
              middleName: '',
              lastName: '',
              locations: ['', ''],
              tags: ['experienced', 'patient'],
            },
          },
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput
  ): Promise<User> {
    const userCreateInput: Prisma.UserCreateInput = body;
    // Construct roles.
    userCreateInput.roles = {connect: {name: ROLE_NAME_AREA_MANAGER}};

    return await this.userService.create({
      data: userCreateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        profile: true,
      },
    });
  }

  @Get('')
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getUsers(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
      }
    }

    whereConditions.push({roles: {some: {name: ROLE_NAME_AREA_MANAGER}}});

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 3] Get users.
    const [users, total] = await this.userService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
      include: {
        roles: true,
        profile: true,
      },
    });

    // [step 4] Return users without password.
    const records = users.map(user => {
      return this.userService.withoutPassword(user);
    });

    return generatePaginationResponse({page, pageSize, records, total});
  }

  @Get(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {
        profile: true,
      },
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: '',
          phone: '',
          profile: {
            update: {
              firstName: '',
              middleName: '',
              lastName: '',
              locations: ['', ''],
              tags: ['experienced', 'patient'],
            },
          },
        },
      },
    },
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput
  ): Promise<User> {
    const userUpdateInput: Prisma.UserUpdateInput = body;

    return await this.userService.update({
      where: {id: userId},
      data: userUpdateInput,
      include: {profile: true},
    });
  }

  @Delete(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.delete({
      where: {id: userId},
    });
  }

  /* End */
}
