export function getServerConfig(): {
  environment: string | undefined;
  port: number;
} {
  return {
    environment: process.env.ENVIRONMENT,
    port: parseInt(process.env.PORT!, 10) || 3000,
  };
}
