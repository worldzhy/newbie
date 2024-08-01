import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {SpotCurrencyService} from './currency.service';

@ApiTags('Spot / Currency')
@ApiBearerAuth()
@Controller('currencies')
export class SpotCurrencyController {
  constructor(private readonly currencyService: SpotCurrencyService) {}

  @Get(':currency')
  async getCurrency(@Param('currency') currency: string) {
    return await this.currencyService.getCurrency(currency);
  }

  @Get('pairs')
  async getAllCurrencyPairs() {
    return await this.currencyService.getAllCurrencyPairs();
  }

  @Get('pairs/:currencyPair')
  async getCurrencyPair(@Param('currencyPair') currencyPair: string) {
    return await this.currencyService.getCurrencyPair(currencyPair);
  }

  @Get('pairs/refresh')
  async getNewCurrencyPairs() {
    return await this.currencyService.refreshCurrencyPairs();
  }

  /* End */
}
