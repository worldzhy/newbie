export function getPrismaConfig(): {
  DATABASE_URL: string | undefined;
} {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
  };
}
