import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {getAwsConfig} from '../pulumi.config';
import {buildResourceOptions} from '@toolkit/utilities/pulumi.util';

@Injectable()
export class AwsIamUser_Stack {
  static getStackParams() {
    return {
      iamUserName: 'henry',
    };
  }

  static checkStackParams(params: {}) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['gitUsername', 'gitPassword'];
  }

  static getStackProgram = (params: {iamUserName: string}) => async () => {
    // [step 1] Guard statement.
    // [step 2] Get or create IAM user group.
    let uniqueResourceName: string;

    const userGroupName = 'Developer';
    const developerUserGroup = await aws.iam.getGroup({
      groupName: 'Developer',
    });

    if (null === developerUserGroup || undefined === developerUserGroup) {
      uniqueResourceName = 'UserGroup';
      new aws.iam.Group(
        uniqueResourceName,
        {
          name: userGroupName,
        },
        buildResourceOptions(getAwsConfig().region!)
      );

      uniqueResourceName = 'iam-usergroup-policy-attachment';
      new aws.iam.GroupPolicyAttachment(
        uniqueResourceName,
        {
          group: userGroupName,
          policyArn:
            (getAwsConfig().region!.startsWith('cn')
              ? 'arn:aws-cn:'
              : 'arn:aws:') + 'iam::aws:policy/AWSCodeCommitPowerUser',
        },
        buildResourceOptions(getAwsConfig().region!)
      );
    }

    // [step 3] Create a user.
    uniqueResourceName = 'iam-user';
    const iamUser = new aws.iam.User(
      uniqueResourceName,
      {
        name: params.iamUserName,
      },
      buildResourceOptions(getAwsConfig().region!)
    );

    uniqueResourceName = 'iam-usergroup-membership';
    new aws.iam.UserGroupMembership(
      uniqueResourceName,
      {
        user: iamUser.name,
        groups: [userGroupName],
      },
      buildResourceOptions(getAwsConfig().region!)
    );

    // [step 4] Create HTTPS Git credentials for Amazon CodeCommit
    uniqueResourceName = 'service-specific-credential';
    const serviceSpecificCredential = new aws.iam.ServiceSpecificCredential(
      uniqueResourceName,
      {
        serviceName: 'codecommit.amazonaws.com',
        userName: iamUser.name,
      },
      buildResourceOptions(getAwsConfig().region!)
    );

    return {
      gitUsername: serviceSpecificCredential.serviceUserName,
      gitPassword: serviceSpecificCredential.servicePassword,
    };
  };

  /* End */
}
