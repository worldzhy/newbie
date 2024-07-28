import {Module} from '@nestjs/common';
import {SpotAccountController} from './account.controller';
import {SpotAccountService} from './account.service';
import {SpotCurrencyController} from './currency.controller';
import {SpotCurrencyService} from './currency.service';
import {SpotOrderController} from './order.controller';
import {SpotOrderService} from './order.service';

@Module({
  controllers: [
    SpotAccountController,
    SpotCurrencyController,
    SpotOrderController,
  ],
  providers: [SpotAccountService, SpotCurrencyService, SpotOrderService],
  exports: [SpotAccountService, SpotCurrencyService, SpotOrderService],
})
export class GateApiSpotModule {}
