export function getAwsPinpointConfig(): {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  pinpointApplicationId: string;
  pinpointFromAddress: string;
  pinpointSenderId: string;
} {
  return {
    region: process.env.AWS_PINPOINT_REGION || 'default',
    accessKeyId: process.env.AWS_PINPOINT_ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.AWS_PINPOINT_SECRET_ACCESS_KEY || 'default',
    pinpointApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID || 'default',
    pinpointFromAddress: process.env.AWS_PINPOINT_FROM_ADDRESS || 'default',
    pinpointSenderId: process.env.AWS_PINPOINT_SENDER_ID || 'default',
  };
}
