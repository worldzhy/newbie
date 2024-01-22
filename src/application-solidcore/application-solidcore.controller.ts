import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Solidcore]')
@Controller()
export class ApplicationSolidcoreController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Solidcore!</h1>';
  }

  /* End */
}
