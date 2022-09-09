import {Module} from '@nestjs/common';
import {DatapipeController} from './datapipe.controller';
import {DatapipeService} from './datapipe.service';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {DatapipePumpModule} from './pump/pump.module';

@Module({
  imports: [PrismaModule, DatapipePumpModule],
  controllers: [DatapipeController],
  providers: [DatapipeService],
  exports: [DatapipeService],
})
export class DatapipeModule {}
