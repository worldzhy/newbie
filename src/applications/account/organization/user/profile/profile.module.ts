import {Module} from '@nestjs/common';
import {UserProfileController} from './profile.controller';
import {UserProfileService} from './profile.service';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
