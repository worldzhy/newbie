export enum Order_Type {
  Limit = 'limit',
  Market = 'market',
}

export enum Order_Side {
  Buy = 'buy',
  Sell = 'sell',
}

export enum Order_TimeInForce {
  GoodTillCancelled = 'gtc',
  ImmediateOrCancelled = 'ioc', // 立即成交或者取消，只吃单不挂单
  PendingOrCancelled = 'poc', // 被动委托，只挂单不吃单
  FillOrKill = 'fok', // 全部成交或者全部取消
}

export enum Order_Status {
  Open = 'open',
  Closed = 'closed',
  Cancelled = 'cancelled',
}

export enum Order_Filter {
  Open = 'open',
  Finished = 'finished',
}

export const MAX_USDT_AMOUNT_IN_ORDER = 10;
export const MIN_USDT_AMOUNT_IN_WALLET = 100;

export const LARK_CHANNEL_NAME = 'cc_trader_channel';
