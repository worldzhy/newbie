import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {CurrencyService} from './currency.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {DepositService} from './deposit.service';

@ApiTags('Crypto Hunter')
@ApiBearerAuth()
@Controller('gate')
export class GateController {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly depositService: DepositService
  ) {}

  @NoGuard()
  @Get('currencies/usdt')
  async getCurrency() {
    const currency = 'USDT';
    return await this.currencyService.getCurrency(currency);
  }

  @NoGuard()
  @Get('currencies')
  async getAllCurrencies() {
    return await this.currencyService.getAllCurrencies();
  }

  @NoGuard()
  @Get('currency-pairs')
  async getAllCurrencyPairs() {
    return await this.currencyService.getAllCurrencyPairs();
  }

  @NoGuard()
  @Get('currency-pairs/new')
  async getNewCurrencyPairs() {
    return await this.currencyService.getNewCurrencyPairs();
  }

  @NoGuard()
  @Get('deposit-address/usdt')
  async getDepositAddress() {
    const currency = 'USDT';
    return await this.depositService.getDepositAddress(currency);
  }

  /* End */
}
