import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from './account/auth/auth-jwt/auth-jwt.decorator';

@ApiTags('[Application]')
@Controller()
export class ApplicationController {
  @Public()
  @Get('')
  hello(): string {
    return 'Anyone can write code that a computer can understand. \nGood programmers can write code that PEOPLE can understand!';
  }

  @Public()
  @Get('manifesto')
  manifesto(): string {
    return 'Anyone can write code that a computer can understand. \nGood programmers can write code that PEOPLE can understand!';
  }

  /* End */
}
