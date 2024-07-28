import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {SpotOrderService} from './order.service';
import {Order_Filter} from '@/application/application.constants';

@ApiTags('Spot / Order')
@ApiBearerAuth()
@Controller('orders')
export class SpotOrderController {
  constructor(private readonly orderService: SpotOrderService) {}

  @Get('')
  async listOrders(
    @Query('currencyPair') currencyPair: string,
    @Query('status') status: Order_Filter
  ) {
    return await this.orderService.list({currencyPair, status});
  }

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
      amount: number;
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
      amount: number;
    }
  ) {
    return await this.orderService.sell(body);
  }

  /* End */
}
