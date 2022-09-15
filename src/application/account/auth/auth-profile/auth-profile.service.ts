import {Injectable} from '@nestjs/common';
import {ProfileService} from '../../profile/profile.service';

@Injectable()
export class AuthProfileService {
  private profileService = new ProfileService();

  /**
   * Entry of the verification is in 'auth-profile.strategy.ts'.
   *
   * @param {{
   *     givenName: string;
   *     middleName: string;
   *     familyName: string;
   *     suffix?: string;
   *     birthday: Date;
   *   }} profile
   * @returns {(Promise<{data: Profile | null; err: object | null}>)}
   * @memberof AuthProfileService
   */
  async validateByProfile(profile: {
    givenName: string;
    middleName: string;
    familyName: string;
    suffix?: string;
    birthday: Date;
  }): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get profiles.
    const {givenName, middleName, familyName, suffix, birthday} = profile;
    if ((givenName && middleName && familyName && birthday) === undefined) {
      return {
        data: null,
        err: {
          message:
            'The givenName, middleName, familyName and birthday are required.',
        },
      };
    }

    // [step 2] Validate name and birthday.
    const profiles = await this.profileService.findMany({
      where: {givenName, middleName, familyName, suffix, birthday},
    });
    if (profiles.length === 1) {
      return {
        data: profiles[0],
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'There are 0 or multiple users.'},
      };
    }
  }

  /* End */
}
