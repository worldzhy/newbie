import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../_prisma/_prisma.module';
import {ProfileController} from './profile.controller';
import {ProfileService} from './profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
