import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {verifyS3BucketName} from '../../../../../_aws/_aws.validator';
import {buildResourceOptions} from '../pulumi-stack.util';
import {randomCode} from '../../../../../_util/_util';
import {getAwsConfig} from '../../../../../_config/_aws.config';

@Injectable()
export class AwsS3_Stack {
  static getStackParams() {
    return {
      bucketName: 'example-bucket',
      isPublic: false,
    };
  }

  static checkStackParams(params: {bucketName: string}) {
    if (params.bucketName) {
      return verifyS3BucketName(params.bucketName + randomCode(4))
        ? true
        : false;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['bucketName', 'bucketArn'];
  }

  static getStackProgram =
    (params: {bucketName: string; isPublic: boolean}) => async () => {
      const isPublic = params.isPublic;
      const bucketName = params.bucketName + '-' + randomCode(4);

      // [step 1] Create a bucket.
      let uniqueResourceName = 's3-bucket';
      const bucket = new aws.s3.Bucket(
        uniqueResourceName,
        {bucket: bucketName},
        buildResourceOptions(getAwsConfig().region!)
      );

      // [step 2] Set public access policy to allow public read of all objects in bucket.
      if (isPublic) {
        uniqueResourceName = 's3-bucket-policy';
        new aws.s3.BucketPolicy(
          uniqueResourceName,
          {
            bucket: bucket.bucket, // Refer to the bucket created earlier.
            policy: bucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
          },
          buildResourceOptions(getAwsConfig().region!)
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
                getAwsConfig().region!.startsWith('cn')
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
