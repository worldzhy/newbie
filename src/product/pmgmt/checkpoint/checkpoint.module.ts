import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {CheckpointService} from './checkpoint.service';

@Module({
  imports: [PrismaModule],
  providers: [CheckpointService],
  exports: [CheckpointService],
})
export class CheckpointModule {}
