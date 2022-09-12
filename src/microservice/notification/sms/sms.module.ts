import {Module} from '@nestjs/common';
import {AwsModule} from '../../../_aws/_aws.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {NotificationConfigurationModule} from '../configuration/configuration.module';
import {SmsController} from './sms.controller';
import {SmsService} from './sms.service';

@Module({
  imports: [PrismaModule, AwsModule, NotificationConfigurationModule],
  controllers: [SmsController],
  providers: [
    {
      provide: 'NotificationConfiguration',
      useValue: 'notification-configuration',
    },
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
