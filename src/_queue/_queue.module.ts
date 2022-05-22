import {Module} from '@nestjs/common';
import {PrismaModule} from '../_prisma/_prisma.module';
import {QueueController} from './_queue.controller';
import {QueueService} from './_queue.service';

@Module({
  imports: [PrismaModule],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
