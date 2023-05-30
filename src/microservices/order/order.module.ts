import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {AddressModule} from './address/address.module';
import {CustomerModule} from './customer/customer.module';
import {OrderItemModule} from './item/item.module';
import {StripeModule} from './payment/stripe/stripe.module';

@Module({
  imports: [AddressModule, CustomerModule, OrderItemModule, StripeModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
