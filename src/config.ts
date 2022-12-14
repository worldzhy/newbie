export function getServerConfig(): {
  node_framework: string | undefined;
  environment: string | undefined;
  port: number;
} {
  return {
    node_framework: process.env.NODE_FRAMEWORK || 'express', // support 'express' and 'fastify'.
    environment: process.env.ENVIRONMENT,
    port: parseInt(process.env.PORT!, 10) || 3000,
  };
}
