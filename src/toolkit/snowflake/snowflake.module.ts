import {Module, Global} from '@nestjs/common';
import {SnowflakeService} from './snowflake.service';
import {StaffSfService} from './staffSf.service';

@Global()
@Module({
  providers: [SnowflakeService, StaffSfService],
  exports: [SnowflakeService, StaffSfService],
})
export class SnowflakeModule {}
