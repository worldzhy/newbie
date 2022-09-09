import {Module} from '@nestjs/common';
import {DatapipePumpController} from './pump.controller';
import {DatapipePumpService} from './pump.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatapipePumpController],
  providers: [DatapipePumpService],
  exports: [DatapipePumpService],
})
export class DatapipePumpModule {}
