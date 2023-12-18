import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Solidcore]')
@Controller()
export class ApplicationSolidcoreController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Solidcore!</h1>';
  }

  /* End */
}