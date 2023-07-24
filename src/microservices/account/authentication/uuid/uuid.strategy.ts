import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {UserService} from '../../user/user.service';
import {verifyUuid} from '../../../../toolkit/validators/user.validator';

@Injectable()
export class AuthUuidStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.uuid'
) {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    // [step 1] Guard statement.
    const uuid = req.body.uuid;
    if (!verifyUuid(uuid)) {
      throw new UnauthorizedException('The uuid is invaild.');
    }

    // [step 2] Validate uuid.
    const user = await this.userService.findUnique({
      where: {id: uuid},
    });
    if (user) {
      return true;
    } else {
      throw new UnauthorizedException('The uuid is incorrect.');
    }
  }
}
