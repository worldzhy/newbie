import {Global, Module} from '@nestjs/common';
import {GateApiAccountModule} from './account/account.module';
import {GateApiSpotModule} from './spot/spot.module';
import {GateApiWalletModule} from './wallet/wallet.module';

@Global()
@Module({
  imports: [GateApiAccountModule, GateApiSpotModule, GateApiWalletModule],
  exports: [GateApiAccountModule, GateApiSpotModule, GateApiWalletModule],
})
export class GateApiModule {}
