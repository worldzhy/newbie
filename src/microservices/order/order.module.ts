import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {AddressModule} from './address/address.module';
import {CustomerModule} from './customer/customer.module';
import {OrderItemModule} from './item/item.module';

@Module({
  imports: [AddressModule, CustomerModule, OrderItemModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
