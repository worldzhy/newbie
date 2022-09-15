import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {CheckpointController} from './checkpoint.controller';
import {CheckpointService} from './checkpoint.service';

@Module({
  imports: [PrismaModule],
  controllers: [CheckpointController],
  providers: [CheckpointService],
  exports: [CheckpointService],
})
export class CheckpointModule {}
