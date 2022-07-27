import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {ProfileService} from './profile.service';

@ApiTags('App / Account / Profile')
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
    const result = await this.profileService.findOne({id: profileId});
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
   * Create or update profile.
   * [1] Create a new profile if there is not 'id' in request body. 'user' is required.
   * [2] Update the profile if there is 'id' in request body. 'user' is optional.
   * @returns
   * @memberof ProfileController
   */
  @Post('profiles/')
  @ApiBody({
    description:
      "Whether the request body contains an 'id' determines whether to create or update.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          familyName: 'Jobs',
          givenName: 'Steven',
          middleName: 'Paul',
          name: 'Steven Paul Jobs',
          nickname: 'Steve',
          preferredUsername: 'stevejobs',
          birthday: new Date(),
          gender: 'male',
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
          address: '456 White Finch St. North Augusta, SC 29860',
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
          user: {
            connect: {
              id: '924da395-1921-45fe-b7f5-1198ed78ac24',
            },
          },
        },
      },
      b: {
        summary: '2. Update',
        value: {
          id: '135c948e-d150-4kd6-at58-7798e4d9783f',
          familyName: 'Jobs',
          givenName: 'Steven',
          middleName: 'Paul',
          name: 'Steven Paul Jobs',
          nickname: 'Steve',
          preferredUsername: 'stevejobs',
          birthday: new Date(),
          gender: 'male',
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
          address: '456 White Finch St. North Augusta, SC 29860',
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
          websites: {
            facebook: 'https://www.facebook.com/grace',
            twitter: 'https://twitter.com/elonmusk',
          },
          organization: {
            connect: {
              id: 'fd87bcb0-b4b4-4789-b684-405015da1118',
            },
          },
        },
      },
    },
  })
  async postProfile(
    @Body() body: Prisma.ProfileCreateInput | Prisma.ProfileUpdateInput
  ) {
    // [step 1] Guard statement.

    // [step 2] Create or modify profile.
    if (body.id) {
      const result = await this.profileService.update({
        where: {id: body.id as string},
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
    } else {
      const result = await this.profileService.create(
        body as Prisma.ProfileCreateInput
      );
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
  }

  /* End */
}
