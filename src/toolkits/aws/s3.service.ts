import {Injectable} from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {getAwsConfig} from '../../_config/_aws.config';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: getAwsConfig().region,
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

  async putObject(params: {
    Bucket: string; // The name of the bucket. For example, 'sample_bucket_101'.
    Key: string; // The name of the object. For example, 'sample_upload.txt'.
    Body?: 'BODY'; // The content of the object. For example, 'Hello world!".
  }) {
    const {Bucket, Key, Body} = params;
    return await this.client.send(new PutObjectCommand({Bucket, Key, Body}));
  }

  async getObject(params: {Bucket: string; Key: string}) {
    const {Bucket, Key} = params;
    return await this.client.send(new GetObjectCommand({Bucket, Key}));
  }

  async deleteObject(params: {Bucket: string; Key: string}) {
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
