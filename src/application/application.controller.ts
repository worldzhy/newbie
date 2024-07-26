import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Aircruiser]')
@Controller()
export class ApplicationController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Aircruiser!</h1>';
  }

  /* End */
}
