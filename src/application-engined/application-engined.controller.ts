import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Engined]')
@Controller()
export class ApplicationEnginedController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Engined!</h1>';
  }

  /* End */
}
