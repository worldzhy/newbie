import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../tools/prisma/prisma.module';
import {CheckpointController} from './checkpoint.controller';
import {CheckpointService} from './checkpoint.service';

@Module({
  imports: [PrismaModule],
  controllers: [CheckpointController],
  providers: [CheckpointService],
  exports: [CheckpointService],
})
export class CheckpointModule {}
