import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {GateAccountService} from './account.service';

@ApiTags('Account')
@ApiBearerAuth()
@Controller('account')
export class GateAccountController {
  constructor(private readonly accountService: GateAccountService) {}

  @Get('detail')
  async buy() {
    return await this.accountService.getDetail();
  }

  /* End */
}
