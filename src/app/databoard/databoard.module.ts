import {Module} from '@nestjs/common';
import {DataboardController} from './databoard.controller';
import {DataboardService} from './databoard.service';
import {PrismaModule} from '../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DataboardController],
  providers: [DataboardService],
  exports: [DataboardService],
})
export class DataboardModule {}
