import {Module} from '@nestjs/common';
import {AwsModule} from 'src/_aws/_aws.module';
import {PrismaModule} from 'src/_prisma/_prisma.module';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
