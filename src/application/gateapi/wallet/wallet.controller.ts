import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {WalletService} from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('deposit-address/usdt')
  async getDepositAddress() {
    const currency = 'USDT';
    return await this.walletService.getDepositAddress(currency);
  }

  @Get('total-balance')
  async getTotalBalance() {
    return await this.walletService.getTotalBalance();
  }

  /* End */
}
