export function getElasticConfig(): {
  node: string | undefined;
  username: string | undefined;
  password: string | undefined;
} {
  return {
    node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  };
}
