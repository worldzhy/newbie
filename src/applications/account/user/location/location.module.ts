import {Module} from '@nestjs/common';
import {UserLocationController} from './location.controller';
import {UserLocationService} from './location.service';

@Module({
  controllers: [UserLocationController],
  providers: [UserLocationService],
  exports: [UserLocationService],
})
export class UserLocationModule {}
