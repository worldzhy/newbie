import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {UserProfileService} from '../../user/profile/profile.service';

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
    const {firstName, middleName, lastName, suffix, birthday} = profile;
    if ((firstName && middleName && lastName && birthday) === undefined) {
      throw new UnauthorizedException(
        'The firstName, middleName, lastName and birthday are required.'
      );
    }

    // [step 2] Get profiles.
    const profiles = await this.userProfileService.findMany({
      where: {firstName, middleName, lastName, suffix, birthday},
    });

    if (profiles.length === 1) {
      return true;
    } else {
      throw new UnauthorizedException('There are 0 or multiple users.');
    }
  }
}
