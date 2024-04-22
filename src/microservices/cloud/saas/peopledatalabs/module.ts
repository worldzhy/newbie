import {Module} from '@nestjs/common';
import {PeopledatalabsService} from './peopledatalabs.service';

@Module({
  providers: [PeopledatalabsService],
  exports: [PeopledatalabsService],
})
export class PeopledatalabsModule {}
