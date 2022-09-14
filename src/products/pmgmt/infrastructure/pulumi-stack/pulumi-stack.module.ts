import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../../_prisma/_prisma.module';
import {PulumiStackController} from './pulumi-stack.controller';
import {PulumiStackService} from './pulumi-stack.service';

@Module({
  imports: [PrismaModule],
  controllers: [PulumiStackController],
  providers: [PulumiStackService],
  exports: [PulumiStackService],
})
export class PulumiStackModule {}
