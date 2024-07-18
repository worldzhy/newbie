import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Newbie]')
@Controller()
export class ApplicationController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Newbie!</h1>';
  }

  /* End */
}
