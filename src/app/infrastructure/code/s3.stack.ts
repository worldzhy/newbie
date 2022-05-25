import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.stack';
import {s3} from '@pulumi/aws';
import {PolicyDocument} from '@pulumi/aws/iam';

@Injectable()
export class FileManager extends BaseProgram {
  constructor() {
    super();
    this.initPulumiProgram(pulumiProgram);
  }
  /* End */
}

const pulumiProgram = async () => {
  // Create a bucket and expose a website index document.
  const siteBucket = new s3.Bucket('file-manager-bucket');

  // Create an S3 Bucket Policy to allow public read of all objects in bucket.
  function publicReadPolicyForBucket(bucketName): PolicyDocument {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [
            `arn:aws-cn:s3:::${bucketName}/*`, // Policy refers to bucket name explicitly.
          ],
        },
      ],
    };
  }

  // Set the access policy for the bucket so all objects are readable.
  const bucketPolicy = new s3.BucketPolicy('bucketPolicy', {
    bucket: siteBucket.bucket, // Refer to the bucket created earlier.
    policy: siteBucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
  });

  return {
    websiteUrl: siteBucket.websiteEndpoint,
  };
};
