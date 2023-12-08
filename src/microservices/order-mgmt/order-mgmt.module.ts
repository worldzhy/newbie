import {Global, Module} from '@nestjs/common';
import {StripePaymentIntentService} from './payment/stripe/payment-intent.service';

@Global()
@Module({
  providers: [StripePaymentIntentService],
  exports: [StripePaymentIntentService],
})
export class OrderManagementModule {}
