import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '@microservices/account/security/authentication/public/public.decorator';

@ApiTags('[Newbie]')
@Controller()
export class Application0Controller {
  @Public()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Newbie!</h1>';
  }

  @Public()
  @Get('manifesto')
  manifesto(): string {
    return `
    <h1>Manifesto</h1>
    <h2>&nbsp;&nbsp;Anyone can write code that a computer can understand.</h2>
    <h2>&nbsp;&nbsp;Good programmers can write code that PEOPLE can understand!</h2>
    `;
  }

  @Public()
  @Get('todo')
  todo(): string {
    return `
    <h1>Todos<h1>
    <h2>&nbsp;&nbsp;1. Restrict account permissions to operate resources.</h2>
    `;
  }

  /* End */
}
