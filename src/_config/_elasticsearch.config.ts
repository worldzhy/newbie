export function getElasticsearchConfig(): {
  node: string | undefined;
  username: string | undefined;
  password: string | undefined;
} {
  return {
    node: process.env.ELASTICSEARCH_NODE,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  };
}
