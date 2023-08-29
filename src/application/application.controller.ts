import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/authentication/public/public.decorator';

@ApiTags('[Application]')
@Controller()
export class ApplicationController {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to InceptionPad!</h1>';
  }

  /* End */
}
