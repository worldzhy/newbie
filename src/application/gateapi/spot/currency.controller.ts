import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {SpotCurrencyService} from './currency.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';

@ApiTags('Spot / Currency')
@ApiBearerAuth()
@Controller('currencies')
export class SpotCurrencyController {
  constructor(private readonly currencyService: SpotCurrencyService) {}

  @NoGuard()
  @Get('usdt')
  async getCurrency() {
    const currency = 'USDT';
    return await this.currencyService.getCurrency(currency);
  }

  @NoGuard()
  @Get('')
  async getAllCurrencies() {
    return await this.currencyService.getAllCurrencies();
  }

  @NoGuard()
  @Get('pairs')
  async getAllCurrencyPairs() {
    return await this.currencyService.getAllCurrencyPairs();
  }

  @NoGuard()
  @Get('pairs/new')
  async getNewCurrencyPairs() {
    return await this.currencyService.getNewCurrencyPairs();
  }

  /* End */
}
