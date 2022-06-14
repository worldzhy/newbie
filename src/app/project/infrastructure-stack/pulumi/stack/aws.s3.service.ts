import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {AwsValidator} from '../../../../../_validator/_aws.validator';
import {PulumiUtil} from '../pulumi.util';
import {CommonUtil} from '../../../../../_util/_common.util';

@Injectable()
export class AwsS3_StackService {
  static getStackParams() {
    return {
      bucketName: 'example-bucket',
    };
  }

  static checkStackParams(params: object) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['bucketName', 'bucketArn'];
  }

  static getStackProgram =
    (params: {bucketName: string}, awsRegion: string) => async () => {
      let bucketName = params.bucketName + '-' + CommonUtil.randomCode(4);

      // [step 1] Guard statement.
      if (false === AwsValidator.verifyS3Bucketname(bucketName)) {
        bucketName = 'example-bucket-' + CommonUtil.randomCode(4);
      }

      // Create a bucket.
      let uniqueResourceName = 's3-bucket';
      const bucket = new aws.s3.Bucket(
        uniqueResourceName,
        {bucket: bucketName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // Create an S3 Bucket Policy to allow public read of all objects in bucket.
      function publicReadPolicyForBucket(
        bucketName: string
      ): aws.iam.PolicyDocument {
        return {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [
                awsRegion.startsWith('cn')
                  ? `arn:aws-cn:s3:::${bucketName}/*`
                  : `arn:aws:s3:::${bucketName}/*`, // Policy refers to bucket name explicitly.
              ],
            },
          ],
        };
      }

      // Set the access policy for the bucket so all objects are readable.
      uniqueResourceName = 's3-bucket-policy';
      new aws.s3.BucketPolicy(
        uniqueResourceName,
        {
          bucket: bucket.bucket, // Refer to the bucket created earlier.
          policy: bucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        bucketName: bucketName,
        bucketArn: bucket.arn,
      };
    };
}
