import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {MessageTrackerController} from './mtrac.controller';
import {MessageTrackerService} from './mtrac.service';

@Module({
  imports: [PrismaModule],
  controllers: [MessageTrackerController],
  providers: [MessageTrackerService],
  exports: [MessageTrackerService],
})
export class MessageTrackerModule {}
