import {Module} from '@nestjs/common';
import {CustomLoggerController} from './custom-logger.controller';
import {CustomLoggerService} from './custom-logger.service';
import {AwsModule} from '../aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [CustomLoggerController],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
