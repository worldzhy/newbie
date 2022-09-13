export function postgresConfig(): {
  host: string | undefined;
  port: string | undefined;
  username: string | undefined;
  password: string | undefined;
  schema: string | undefined;
} {
  return {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    schema: process.env.POSTGRES_SCHEMA,
  };
}
