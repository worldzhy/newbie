import {Module, Global} from '@nestjs/common';
import {SnowflakeService} from './snowflake.service';

@Global()
@Module({
  providers: [SnowflakeService],
  exports: [SnowflakeService],
})
export class SnowflakeModule {}
