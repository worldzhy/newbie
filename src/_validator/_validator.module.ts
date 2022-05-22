import {Module} from '@nestjs/common';
import {ValidatorController} from './_validator.controller';
import {ValidatorService} from './_validator.service';

@Module({
  controllers: [ValidatorController],
  providers: [ValidatorService],
  exports: [ValidatorService],
})
export class ValidatorModule {}
