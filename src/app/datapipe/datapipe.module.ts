import {Module} from '@nestjs/common';
import {DatapipeController} from './datapipe.controller';
import {DatapipeService} from './datapipe.service';
import {PrismaModule} from '../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatapipeController],
  providers: [DatapipeService],
  exports: [DatapipeService],
})
export class DatapipeModule {}
