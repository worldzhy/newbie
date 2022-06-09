import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../../../_util/_common.util';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsIamUser_StackService {
  static getStackParams() {
    return {
      iamUserName: 'henry',
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
    return ['gitUsername', 'gitPassword'];
  }

  static getStackProgram =
    (params: {iamUserName: string}, awsRegion: string) => async () => {
      // [step 1] Guard statement.

      // [step 2] Get or create IAM user group.
      let uniqueResourceName: string;

      const userGroupName = 'Developer';
      const developerUserGroup = await aws.iam.getGroup({
        groupName: 'Developer',
      });

      if (null === developerUserGroup || undefined === developerUserGroup) {
        uniqueResourceName = 'UserGroup-';
        new aws.iam.Group(
          uniqueResourceName,
          {
            name: userGroupName,
          },
          PulumiUtil.getResourceOptions(awsRegion)
        );

        uniqueResourceName =
          'iam-usergroup-policy-attachment-' + CommonUtil.randomCode(4);
        new aws.iam.GroupPolicyAttachment(
          uniqueResourceName,
          {
            group: userGroupName,
            policyArn:
              (awsRegion.startsWith('cn') ? 'arn:aws-cn:' : 'arn:aws:') +
              'iam::aws:policy/AWSCodeCommitPowerUser',
          },
          PulumiUtil.getResourceOptions(awsRegion)
        );
      }

      // [step 3] Create a user.
      uniqueResourceName = 'iam-user-' + CommonUtil.randomCode(4);

      const iamUser = new aws.iam.User(
        uniqueResourceName,
        {
          name: params.iamUserName,
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName =
        'iam-usergroup-membership-' + CommonUtil.randomCode(4);
      new aws.iam.UserGroupMembership(
        uniqueResourceName,
        {
          user: iamUser.name,
          groups: [userGroupName],
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // [step 4] Create HTTPS Git credentials for Amazon CodeCommit
      uniqueResourceName =
        'service-specific-credential-' + CommonUtil.randomCode(4);
      const serviceSpecificCredential = new aws.iam.ServiceSpecificCredential(
        uniqueResourceName,
        {
          serviceName: 'codecommit.amazonaws.com',
          userName: iamUser.name,
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        gitUsername: serviceSpecificCredential.serviceUserName,
        gitPassword: serviceSpecificCredential.servicePassword,
      };
    };

  /* End */
}
