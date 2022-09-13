import {Module} from '@nestjs/common';
import {AwsModule} from '../../../_aws/_aws.module';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
