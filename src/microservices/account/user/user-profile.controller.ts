import {Controller, Body, Patch, Param} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';

@ApiTags('Account / User Profile')
@Controller('')
export class UserProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('single-profiles/:profileId')
  @ApiBearerAuth()
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
        },
      },
    },
  })
  async upsertSingleProfile(
    @Param('profileId') profileId: string,
    @Body()
    body: Prisma.UserSingleProfileUncheckedUpdateInput &
      Prisma.UserSingleProfileUncheckedCreateInput
  ) {
    return await this.prisma.userSingleProfile.upsert({
      where: {id: profileId},
      update: body,
      create: body,
    });
  }

  @Patch('multi-profiles:profileId')
  @ApiBearerAuth()
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
        },
      },
    },
  })
  async upsertMultiProfile(
    @Param('profileId') profileId: string,
    @Body()
    body: Prisma.UserMultiProfileUncheckedUpdateInput &
      Prisma.UserMultiProfileUncheckedCreateInput
  ) {
    return await this.prisma.userMultiProfile.upsert({
      where: {id: profileId},
      update: body,
      create: body,
    });
  }

  /* End */
}
