import {Module} from '@nestjs/common';
import {DatatransMissionController} from './mission.controller';
import {DatatransMissionService} from './mission.service';

@Module({
  controllers: [DatatransMissionController],
  providers: [DatatransMissionService],
  exports: [DatatransMissionService],
})
export class DatatransMissionModule {}
