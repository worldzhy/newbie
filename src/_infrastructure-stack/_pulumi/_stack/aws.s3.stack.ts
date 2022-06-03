import {s3} from '@pulumi/aws';
import {PolicyDocument} from '@pulumi/aws/iam';
import {ValidatorAwsService} from '../../../_validator/_validator-aws.service';
import {Config} from '../../../_config/_common.config';

export const createAwsS3Stack = (params: {bucketName: string}) => async () => {
  let bucketName = params.bucketName;

  // [step 1] Guard statement.
  if (false === ValidatorAwsService.verifyS3Bucketname(bucketName)) {
    bucketName = 'default-bucket-name';
  }

  // Create a bucket.
  const bucket = new s3.Bucket(bucketName);

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
            Config.getRegion().startsWith('cn')
              ? `arn:aws-cn:s3:::${bucketName}/*`
              : `arn:aws:s3:::${bucketName}/*`, // Policy refers to bucket name explicitly.
          ],
        },
      ],
    };
  }

  // Set the access policy for the bucket so all objects are readable.
  const bucketPolicyName = bucketName + '-policy';
  const bucketPolicy = new s3.BucketPolicy(bucketPolicyName, {
    bucket: bucket.bucket, // Refer to the bucket created earlier.
    policy: bucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
  });

  return {
    bucketName: bucketName,
    bucketArn: bucket.arn,
  };
};
