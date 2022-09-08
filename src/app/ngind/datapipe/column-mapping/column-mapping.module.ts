import {Module} from '@nestjs/common';
import {DatapipeColumnMappingController} from './column-mapping.controller';
import {DatapipeColumnMappingService} from './column-mapping.service';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [DatapipeColumnMappingController],
  providers: [DatapipeColumnMappingService],
  exports: [DatapipeColumnMappingService],
})
export class DatapipeColumnMappingModule {}
