/** https://api.slack.com/surfaces/messages#payloads */
export enum SlackWebhookMessageType {
  Text = 'text',
  Blocks = 'blocks',
  Attachments = 'attachments',
  Thread_ts = 'thread_ts',
  Mrkdwn = 'mrkdwn',
}
