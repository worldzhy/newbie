import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {SpotAccountService} from './account.service';

@ApiTags('Spot / Account')
@ApiBearerAuth()
@Controller('spot')
export class SpotAccountController {
  constructor(private readonly spotAccountService: SpotAccountService) {}

  @Get('accounts')
  async listSpotAccounts() {
    return await this.spotAccountService.listSpotAccounts();
  }

  @Get('accounts/usdt')
  async getUsdtAccount() {
    return await this.spotAccountService.getBalance('USDT');
  }

  /* End */
}
