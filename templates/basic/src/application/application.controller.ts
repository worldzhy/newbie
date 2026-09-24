import {Controller, Get, HttpStatus, Redirect} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('[Newbie]')
@Controller()
export class ApplicationController {
  @Get('')
  @Redirect('https://github.com/worldzhy/newbie', HttpStatus.FOUND)
  hello(): string {
    return '<h1>Welcome to Newbie!</h1>';
  }

  /* End */
}
