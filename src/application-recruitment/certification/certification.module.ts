import {Module} from '@nestjs/common';
import {CertificationController} from './certification.controller';

@Module({
  controllers: [CertificationController],
})
export class CandidateCertificationModule {}
