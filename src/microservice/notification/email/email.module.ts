import {Module} from '@nestjs/common';
import {AwsModule} from '../../../_aws/_aws.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {NotificationConfigurationModule} from '../configuration/configuration.module';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';

@Module({
  imports: [PrismaModule, AwsModule, NotificationConfigurationModule],
  controllers: [EmailController],
  providers: [
    {
      provide: 'NotificationConfiguration',
      useValue: 'notification-configuration',
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
