import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {SpotOrderService} from './order.service';

@ApiTags('Spot / Order')
@ApiBearerAuth()
@Controller('orders')
export class SpotOrderController {
  constructor(private readonly orderService: SpotOrderService) {}

  @Post('buy')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {currencyPair: '10SET_USDT', amount: 1}},
    },
  })
  async buy(
    @Body()
    body: {
      currencyPair: string;
      amount: string;
    }
  ) {
    return await this.orderService.buy(body);
  }

  @Post('sell')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {currencyPair: '10SET_USDT', amount: 1}},
    },
  })
  async sell(
    @Body()
    body: {
      currencyPair: string;
      amount: string;
    }
  ) {
    return await this.orderService.sell(body);
  }

  /* End */
}
