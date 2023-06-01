import {Module} from '@nestjs/common';
import {CandidateProfileController} from './profile.controller';
import {CandidateProfileService} from './profile.service';

@Module({
  controllers: [CandidateProfileController],
  providers: [CandidateProfileService],
  exports: [CandidateProfileService],
})
export class CandidateProfileModule {}
