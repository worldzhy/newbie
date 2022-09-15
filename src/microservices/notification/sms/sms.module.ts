import {Module} from '@nestjs/common';
import {AwsModule} from '../../../tools/aws/aws.module';
import {PrismaModule} from '../../../tools/prisma/prisma.module';
import {SmsController} from './sms.controller';
import {SmsService} from './sms.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
