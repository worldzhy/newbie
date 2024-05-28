export enum FeishuNotificationStatus {
  SUCCESS = 0,
}

export enum FeishuNotificationMsgType {
  /** 文本 */
  text = 'text',
  /** 富文本 */
  post = 'post',
  /** 群名片 */
  shareChat = 'share_chat',
  /** 图片 */
  image = 'image',
  /** 消息卡片 */
  interactive = 'interactive',
}
