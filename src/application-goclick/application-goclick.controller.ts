import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[GoClick]')
@Controller()
export class ApplicationGoClickController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to GoClick!</h1>';
  }

  /* End */
}
