import {Module} from '@nestjs/common';
import {CandidateCertificationController} from './certification.controller';
import {CandidateCertificationService} from './certification.service';

@Module({
  controllers: [CandidateCertificationController],
  providers: [CandidateCertificationService],
  exports: [CandidateCertificationService],
})
export class CandidateCertificationModule {}
