import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from './product/account/auth/auth-jwt/auth-jwt.decorator';

@ApiTags('[App]')
@Controller()
export class AppController {
  /**
   * This is for health check
   *
   * @returns
   * @memberof AppController
   */
  @Public()
  @Get('/app/manifesto')
  hello() {
    return 'Anyone can write code that a computer can understand. \nGood programmers can write code that PEOPLE can understand!';
  }

  /* End */
}
