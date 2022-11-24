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
import {
  PermissionAction,
  Prisma,
  UserProfile,
  UserProfileGender,
} from '@prisma/client';
import {RequirePermission} from '../../authorization/authorization.decorator';
import {UserProfileService} from './profile.service';

@ApiTags('[Application] Account / User / Profile')
@ApiBearerAuth()
@Controller('user-profiles')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.UserProfile)
  @ApiBody({
    description: 'Create a user profile.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          userId: '924da395-1921-45fe-b7f5-1198ed78ac24',
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          suffix: 'PhD',
          birthday: new Date(),
          gender: UserProfileGender.MALE,
          hasPCP: true,
          address: '456 White Finch St. North Augusta, SC 29860',
          zipcode: '21000',
          geoJSON: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          },
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createUserProfile(
    @Body() body: Prisma.UserProfileUncheckedCreateInput
  ): Promise<UserProfile> {
    return await this.userProfileService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.UserProfile)
  async getUserProfiles(
    @Query() query: {name?: string; page?: string}
  ): Promise<UserProfile[]> {
    // [step 1] Construct where argument.
    let where: Prisma.UserProfileWhereInput | undefined;
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        where = {
          OR: [
            {givenName: {search: name}},
            {familyName: {search: name}},
            {middleName: {search: name}},
          ],
        };
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

    // [step 3] Get user profiles.
    return await this.userProfileService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':profileId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.UserProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    description: 'The uuid of the profile.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserProfile(
    @Param('profileId') profileId: string
  ): Promise<UserProfile | null> {
    return await this.userProfileService.findUnique({where: {id: profileId}});
  }

  @Patch(':profileId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.UserProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    description: 'The uuid of the profile.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user profile.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
          suffix: 'PhD',
          birthday: '2019-05-27T11:53:32.118Z',
          gender: UserProfileGender.MALE,
          hasPCP: true,
          address: '456 White Finch St. North Augusta, SC 29860',
          zipcode: '21000',
          geoJSON: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          },
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async updateUserProfile(
    @Param('profileId') profileId: string,
    @Body() body: Prisma.UserProfileUpdateInput
  ): Promise<UserProfile> {
    return await this.userProfileService.update({
      where: {id: profileId},
      data: body,
    });
  }

  @Delete(':profileId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.UserProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUserProfile(
    @Param('profileId') profileId: string
  ): Promise<UserProfile> {
    return await this.userProfileService.delete({
      where: {id: profileId},
    });
  }

  @Get('genders')
  listUserProfileGenders(): string[] {
    return Object.keys(UserProfileGender);
  }

  /* End */
}
