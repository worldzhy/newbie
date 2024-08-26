import {Global, Module} from '@nestjs/common';
import {PuppeteerService} from './puppeteer.service';

@Global()
@Module({
  providers: [PuppeteerService],
  exports: [PuppeteerService],
})
export class PuppeteerModule {}
