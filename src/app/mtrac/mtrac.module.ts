import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {MtracController} from './mtrac.controller';
import {MtracService} from './mtrac.service';

@Module({
  imports: [PrismaModule],
  controllers: [MtracController],
  providers: [MtracService],
  exports: [MtracService],
})
export class MtracModule {}
