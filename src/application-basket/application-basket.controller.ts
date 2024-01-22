import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Basket]')
@Controller()
export class ApplicationBasketController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Basket!</h1>';
  }

  /* End */
}
