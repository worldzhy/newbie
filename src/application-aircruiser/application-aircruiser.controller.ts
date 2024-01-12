import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Aircruiser]')
@Controller()
export class ApplicationAircruiserController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Aircruiser!</h1>';
  }

  /* End */
}
