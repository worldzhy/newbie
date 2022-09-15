import {Controller, Get, Post, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  UserProfile,
  UserProfileEthnicityType,
  UserProfileRaceType,
} from '@prisma/client';
import {UserProfileService} from './profile.service';

@ApiTags('[Application] Account / User / Profile')
@ApiBearerAuth()
@Controller('users')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Post('profiles')
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
          gender: 'male',
          race: UserProfileRaceType.OTHER,
          ethnicity: UserProfileEthnicityType.HISPANIC,
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

  @Get('profiles/:profileId')
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

  @Patch('profiles/:profileId')
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
          gender: 'male',
          race: UserProfileRaceType.OTHER,
          ethnicity: UserProfileEthnicityType.HISPANIC,
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

  /* End */
}
