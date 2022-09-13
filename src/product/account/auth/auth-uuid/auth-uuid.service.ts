import {Injectable} from '@nestjs/common';
import * as validator from '../../account.validator';
import {UserService} from '../../user/user.service';

@Injectable()
export class AuthUuidService {
  private userService = new UserService();

  /**
   * Entry of the verification is in 'auth-uuid.strategy.ts'.
   *
   * @param {string} uuid
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AuthUuidService
   */
  async validateByUuid(
    uuid: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    if (!validator.verifyUuid(uuid)) {
      return {
        data: null,
        err: {
          message: 'The uuid is invaild.',
        },
      };
    }

    // [step 2] Validate uuid.
    const user = await this.userService.findOne({
      id: uuid,
    });
    if (user) {
      return {
        data: user,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'The uuid is incorrect.'},
      };
    }
  }

  /* End */
}
