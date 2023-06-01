import {Injectable} from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import {getAwsS3Config} from './s3.config';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: getAwsS3Config().region,
      credentials: {
        accessKeyId: getAwsS3Config().accessKeyId,
        secretAccessKey: getAwsS3Config().secretAccessKey,
      },
    });
  }

  async createBucket(bucketName: string) {
    return await this.client.send(
      new CreateBucketCommand({Bucket: bucketName})
    );
  }

  async deleteBucket(bucketName: string) {
    return await this.client.send(
      new DeleteBucketCommand({Bucket: bucketName})
    );
  }

  async putObject(params: PutObjectCommandInput) {
    const {Bucket, Key, Body} = params;
    return await this.client.send(new PutObjectCommand({Bucket, Key, Body}));
  }

  async getObject(params: GetObjectCommandInput) {
    const {Bucket, Key} = params;
    return await this.client.send(new GetObjectCommand({Bucket, Key}));
  }

  async deleteObject(params: DeleteObjectCommandInput) {
    const {Bucket, Key} = params;
    return await this.client.send(new DeleteObjectCommand({Bucket, Key}));
  }

  async deleteObjects(params: {
    Bucket: string;
    Delete: {Objects: [{Key: string}]};
  }) {
    const {Bucket, Delete} = params;
    return await this.client.send(new DeleteObjectsCommand({Bucket, Delete}));
  }

  getLinesFromFile(file) {
    const objects = Array(Object);
    const strings = file.Body.toString().split('\n');
    for (const str of strings) {
      if (str.length > 0) {
        objects.push(JSON.parse(str));
      }
    }
    return objects;
  }
}
