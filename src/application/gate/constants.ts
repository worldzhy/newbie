// Order related
enum Order_Type {
  Limit = 'limit',
  Market = 'market',
}

enum Order_Side {
  Buy = 'buy',
  Sell = 'sell',
}

enum Order_TimeInForce {
  GoodTillCancelled = 'gtc',
  ImmediateOrCancelled = 'ioc', // 立即成交或者取消，只吃单不挂单
  PendingOrCancelled = 'poc', // 被动委托，只挂单不吃单
  FillOrKill = 'fok', // 全部成交或者全部取消
}
