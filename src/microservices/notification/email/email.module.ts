import {Module} from '@nestjs/common';
import {AwsModule} from '../../../toolkits/aws/aws.module';
import {PrismaModule} from '../../../toolkits/prisma/prisma.module';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
