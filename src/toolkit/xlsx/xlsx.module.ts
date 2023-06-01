import {Module, Global} from '@nestjs/common';
import {XLSXService} from './xlsx.service';

@Global()
@Module({
  providers: [XLSXService],
  exports: [XLSXService],
})
export class XLSXModule {}
