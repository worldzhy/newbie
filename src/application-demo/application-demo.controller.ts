import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Demo]')
@Controller()
export class ApplicationDemoController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Demo!</h1>';
  }

  /* End */
}
