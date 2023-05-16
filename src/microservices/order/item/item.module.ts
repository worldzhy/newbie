import {Module} from '@nestjs/common';
import {OrderItemService} from './item.service';

@Module({
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
