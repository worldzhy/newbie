import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('[Newbie]')
@Controller()
export class ApplicationController {
  @Get('')
  hello(): string {
    return '<h1>Welcome to Newbie!</h1>';
  }

  /* End */
}
