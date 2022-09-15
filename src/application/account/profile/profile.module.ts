import {Module} from '@nestjs/common';
import {PrismaModule} from '../../../toolkits/prisma/prisma.module';
import {UserProfileController} from './profile.controller';
import {UserProfileService} from './profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
