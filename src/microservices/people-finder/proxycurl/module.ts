import {Module} from '@nestjs/common';
import {ProxycurlService} from './proxycurl.service';

@Module({
  providers: [ProxycurlService],
  exports: [ProxycurlService],
})
export class ProxycurlModule {}
