import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {AwsValidator} from '../../../../../_validator/_aws.validator';
import {PulumiUtil} from '../pulumi.util';
import {CommonUtil} from '../../../../../_util/_common.util';

@Injectable()
export class AwsS3_Stack {
  static getStackParams() {
    return {
      bucketName: 'example-bucket',
      isPublic: false,
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
    (
      params: {bucketName: string; isPublic: boolean},
      awsConfig: {region: string}
    ) =>
    async () => {
      const isPublic = params.isPublic;
      let bucketName = params.bucketName + '-' + CommonUtil.randomCode(4);

      // [step 1] Guard statement.
      if (false === AwsValidator.verifyS3Bucketname(bucketName)) {
        bucketName = 'example-bucket-' + CommonUtil.randomCode(4);
      }

      // [step 2] Create a bucket.
      let uniqueResourceName = 's3-bucket';
      const bucket = new aws.s3.Bucket(
        uniqueResourceName,
        {bucket: bucketName},
        PulumiUtil.getResourceOptions(awsConfig.region)
      );

      // [step 3] Set public access policy to allow public read of all objects in bucket.
      if (isPublic) {
        uniqueResourceName = 's3-bucket-policy';
        new aws.s3.BucketPolicy(
          uniqueResourceName,
          {
            bucket: bucket.bucket, // Refer to the bucket created earlier.
            policy: bucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
          },
          PulumiUtil.getResourceOptions(awsConfig.region)
        );
      }
      // Define the function
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
                awsConfig.region.startsWith('cn')
                  ? `arn:aws-cn:s3:::${bucketName}/*`
                  : `arn:aws:s3:::${bucketName}/*`, // Policy refers to bucket name explicitly.
              ],
            },
          ],
        };
      }

      return {
        bucketName: bucketName,
        bucketArn: bucket.arn,
      };
    };
}
