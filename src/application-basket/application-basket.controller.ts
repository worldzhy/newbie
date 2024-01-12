import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Basket]')
@Controller()
export class ApplicationBasketController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Basket!</h1>';
  }

  /* End */
}
