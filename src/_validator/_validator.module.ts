import {Module} from '@nestjs/common';
import {ValidatorController} from './_validator.controller';
import {ValidatorAccountService} from './_validator-account.service';
import {ValidatorAwsService} from './_validator-aws.service';
import {ValidatorAppService} from './_validator-app.service';

@Module({
  controllers: [ValidatorController],
  providers: [
    ValidatorAccountService,
    ValidatorAwsService,
    ValidatorAppService,
  ],
  exports: [ValidatorAccountService, ValidatorAwsService, ValidatorAppService],
})
export class ValidatorModule {}
