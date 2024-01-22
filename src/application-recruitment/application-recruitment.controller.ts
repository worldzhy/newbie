import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('[Recruitment]')
@Controller()
export class ApplicationRecruitmentController {
  @NoGuard()
  @Get('')
  hello(): string {
    return '<h1>Welcome to Recruitment!</h1>';
  }

  /* End */
}
