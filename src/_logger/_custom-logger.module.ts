import {Module} from '@nestjs/common';
import {CustomLoggerController} from './_custom-logger.controller';
import {CustomLoggerService} from './_custom-logger.service';
import {AwsModule} from '../_aws/_aws.module';

@Module({
  imports: [AwsModule],
  controllers: [CustomLoggerController],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
