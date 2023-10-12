import {Global, Module} from '@nestjs/common';
import {OrderService} from './order/order.service';
import {StripePaymentIntentService} from './payment/stripe/payment-intent.service';
import {OrderItemService} from './order/item/item.service';

@Global()
@Module({
  providers: [OrderService, OrderItemService, StripePaymentIntentService],
  exports: [OrderService, OrderItemService, StripePaymentIntentService],
})
export class OrderManagementModule {}
