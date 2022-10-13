import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {UserProfileService} from '../../organization/user/profile/profile.service';

@Injectable()
export class AuthProfileStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.user-profile'
) {
  private userProfileService = new UserProfileService();

  constructor() {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    // [step 1] Guard statement.
    const profile = req.body;
    const {givenName, middleName, familyName, suffix, birthday} = profile;
    if ((givenName && middleName && familyName && birthday) === undefined) {
      throw new UnauthorizedException(
        'The givenName, middleName, familyName and birthday are required.'
      );
    }

    // [step 2] Get profiles.
    const profiles = await this.userProfileService.findMany({
      where: {givenName, middleName, familyName, suffix, birthday},
    });

    if (profiles.length === 1) {
      return true;
    } else {
      throw new UnauthorizedException('There are 0 or multiple users.');
    }
  }
}
