import {Module} from '@nestjs/common';
import {AwsModule} from '../../../_aws/_aws.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {SmsController} from './sms.controller';
import {SmsService} from './sms.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
