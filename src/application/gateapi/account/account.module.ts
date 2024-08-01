import {Module} from '@nestjs/common';
import {GateAccountController} from './account.controller';
import {GateAccountService} from './account.service';

@Module({
  controllers: [GateAccountController],
  providers: [GateAccountService],
  exports: [GateAccountService],
})
export class GateApiAccountModule {}
