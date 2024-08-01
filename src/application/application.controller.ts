import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[CC Trader]')
@Controller()
export class ApplicationController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to CC Trader!</h1>';
  }

  /* End */
}
