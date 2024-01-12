import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Engined]')
@Controller()
export class ApplicationEnginedController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Engined!</h1>';
  }

  /* End */
}
