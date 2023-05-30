import {Module} from '@nestjs/common';
import {StripePaymentIntentService} from './payment-intent.service';

@Module({
  providers: [StripePaymentIntentService],
  exports: [StripePaymentIntentService],
})
export class StripeModule {}
