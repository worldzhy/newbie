import {Module} from '@nestjs/common';
import {PrismaModule} from '../../_prisma/_prisma.module';
import {ProfileController} from './_profile.controller';
import {ProfileService} from './_profile.service';
import {ValidatorModule} from '../../_validator/_validator.module';

@Module({
  imports: [PrismaModule, ValidatorModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
