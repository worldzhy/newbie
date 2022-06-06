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
import {AwsConfig} from '../../_config/_aws.config';

@Injectable()
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: AwsConfig.getRegion(),
    });
  }

  /**
   * Create an Amazon S3 bucket.
   *
   * @param {string} bucketName
   * @returns
   * @memberof S3NewService
   */
  async createBucket(bucketName: string) {
    return await this.client.send(
      new CreateBucketCommand({Bucket: bucketName})
    );
  }

  /**
   * Delete an Amazon S3 bucket.
   *
   * @param {string} bucketName
   * @returns
   * @memberof S3NewService
   */
  async deleteBucket(bucketName: string) {
    return await this.client.send(
      new DeleteBucketCommand({Bucket: bucketName})
    );
  }

  /**
   * Create an object and upload it to the Amazon S3 bucket.
   *
   * @param {{
   *     Bucket: 'BUCKET_NAME'; // The name of the bucket. For example, 'sample_bucket_101'.
   *     Key: 'KEY';            // The name of the object. For example, 'sample_upload.txt'.
   *     Body: 'BODY';          // The content of the object. For example, 'Hello world!".
   *   }} params
   * @returns
   * @memberof S3Service
   */
  async putObject(params: {
    Bucket: string; // The name of the bucket. For example, 'sample_bucket_101'.
    Key: string; // The name of the object. For example, 'sample_upload.txt'.
    Body?: 'BODY'; // The content of the object. For example, 'Hello world!".
  }) {
    const {Bucket, Key, Body} = params;
    return await this.client.send(new PutObjectCommand({Bucket, Key, Body}));
  }

  /**
   * Get an object(file) from Amazon S3 bucket.
   *
   * @param {{
   *     Bucket: string; // The name of the bucket. For example, 'sample_bucket_101'.
   *     Key: string;    // The name of the object. For example, 'sample_upload.txt'.
   *   }} params
   * @returns
   * @memberof S3NewService
   */
  async getObject(params: {Bucket: string; Key: string}) {
    const {Bucket, Key} = params;
    return await this.client.send(new GetObjectCommand({Bucket, Key}));
  }

  /**
   * Delete an object from Amazon S3 bucket.
   *
   * @param {{
   *     Bucket: string; // The name of the bucket. For example, 'sample_bucket_101'.
   *     Key: string;    // The name of the object. For example, 'sample_upload.txt'.
   *   }} params
   * @returns
   * @memberof S3NewService
   */
  async deleteObject(params: {Bucket: string; Key: string}) {
    const {Bucket, Key} = params;
    return await this.client.send(new DeleteObjectCommand({Bucket, Key}));
  }

  /**
   * Delete objects from Amazon S3 bucket.
   *
   * @param {{
   *     Bucket: string;
   *     Delete: {Objects: [{Key: string}]};
   *   }} params
   * @returns
   * @memberof S3NewService
   */
  async deleteObjects(params: {
    Bucket: string;
    Delete: {Objects: [{Key: string}]};
  }) {
    const {Bucket, Delete} = params;
    return await this.client.send(new DeleteObjectsCommand({Bucket, Delete}));
  }

  /**
   * Get lines and convert them to objects.
   *
   * @param {*} file
   * @returns
   * @memberof S3Service
   */
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
