export function getFileManagementConfig(): {
  server_path: string;
  s3_bucket: string | undefined;
} {
  return {
    server_path: process.env.FILE_MANAGEMENT_LOCAL_PATH || './uploaded-files',
    s3_bucket: process.env.FILE_MANAGEMENT_S3_BUCKET,
  };
}
