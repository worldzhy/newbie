import {Module} from '@nestjs/common';
import {GateController} from './gate.controller';
import {CurrencyService} from './currency.service';
import {DepositService} from './deposit.service';

@Module({
  controllers: [GateController],
  providers: [CurrencyService, DepositService],
  exports: [CurrencyService, DepositService],
})
export class GateModule {}
