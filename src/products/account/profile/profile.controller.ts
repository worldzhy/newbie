import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, ProfileEthnicityType, ProfileRaceType} from '@prisma/client';
import {ProfileService} from './profile.service';

@ApiTags('[Product] Account / Profile')
@ApiBearerAuth()
@Controller()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  /**
   * Get profile by id
   *
   * @param {string} profileId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ProfileController
   */
  @Get('profiles/:profileId')
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    description: 'The uuid of the profile.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getProfile(
    @Param('profileId') profileId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.profileService.findUnique({
      where: {id: profileId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get profile failed.'},
      };
    }
  }

  /**
   * Create profile.
   *
   * @returns
   * @memberof ProfileController
   */
  @Post('profiles/users/:userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: '924da395-1921-45fe-b7f5-1198ed78ac24',
  })
  @ApiBody({
    description: 'Create a user profile.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          suffix: 'PhD',
          birthday: new Date(),
          gender: 'male',
          race: ProfileRaceType.OTHER,
          ethnicity: ProfileEthnicityType.HISPANIC,
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
  async createProfile(
    @Param('userId') userId: string,
    @Body() body: Prisma.ProfileCreateWithoutUserInput
  ) {
    // [step 1] Guard statement.

    // [step 2] Create profile.
    const result = await this.profileService.create({
      ...body,
      user: {connect: {id: userId}},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Create profile failed.'},
      };
    }
  }

  /**
   * Update user profile.
   *
   * @param {string} profileId
   * @param {Prisma.ProfileUpdateInput} body
   * @returns
   * @memberof ProfileController
   */
  @Post('profiles/:profileId')
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
          race: ProfileRaceType.OTHER,
          ethnicity: ProfileEthnicityType.HISPANIC,
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
  async updateProfile(
    @Param('profileId') profileId: string,
    @Body() body: Prisma.ProfileUpdateInput
  ) {
    // [step 1] Guard statement.

    // [step 2] Update profile.
    const result = await this.profileService.update({
      where: {id: profileId},
      data: body,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Update profile failed.'},
      };
    }
  }

  /* End */
}
