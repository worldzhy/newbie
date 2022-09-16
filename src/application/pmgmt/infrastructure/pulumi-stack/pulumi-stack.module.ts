import {Module} from '@nestjs/common';
import {PulumiStackController} from './pulumi-stack.controller';
import {PulumiStackService} from './pulumi-stack.service';

@Module({
  controllers: [PulumiStackController],
  providers: [PulumiStackService],
  exports: [PulumiStackService],
})
export class PulumiStackModule {}
