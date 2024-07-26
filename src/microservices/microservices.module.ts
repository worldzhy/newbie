import {Global, Module} from '@nestjs/common';
import {ToolkitModule} from '@toolkit/toolkit.module';

@Global()
@Module({
  imports: [ToolkitModule],
})
export class MicroservicesModule {}
