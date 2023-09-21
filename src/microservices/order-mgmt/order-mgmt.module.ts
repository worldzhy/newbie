import {Global, Module} from '@nestjs/common';
import {OrderService} from './order/order.service';
import {AddressService} from './address/address.service';
import {CustomerService} from './customer/customer.service';
import {StripePaymentIntentService} from './payment/stripe/payment-intent.service';
import {OrderItemService} from './order/item/item.service';

@Global()
@Module({
  providers: [
    AddressService,
    CustomerService,
    OrderService,
    OrderItemService,
    StripePaymentIntentService,
  ],
  exports: [
    AddressService,
    CustomerService,
    OrderService,
    OrderItemService,
    StripePaymentIntentService,
  ],
})
export class OrderManagementModule {}
