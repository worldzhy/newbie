import {PutSecretValueCommand, UpdateSecretVersionStageCommand} from '@aws-sdk/client-secrets-manager';
import {CreateAccessKeyCommand, DeleteAccessKeyCommand, UpdateAccessKeyCommand} from '@aws-sdk/client-iam';
import {STSClient, GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {RotationStrategy, smClient, iamClient} from '../common.js';

export class AwsApiKeyStrategy implements RotationStrategy {
  async createSecret(secretId: string, token: string, currentDict: any): Promise<void> {
    const sts = new STSClient({
      credentials: {
        accessKeyId: currentDict.accessKeyId,
        secretAccessKey: currentDict.secretAccessKey,
      },
    });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    const username = identity.Arn?.split('/').pop();

    if (!username) throw new Error('Could not determine IAM username from current credentials');

    // Create new Key
    const createKeyRes = await iamClient.send(new CreateAccessKeyCommand({UserName: username}));
    const newDict = {
      ...currentDict,
      accessKeyId: createKeyRes.AccessKey?.AccessKeyId,
      secretAccessKey: createKeyRes.AccessKey?.SecretAccessKey,
      username: username,
    };

    await smClient.send(
      new PutSecretValueCommand({
        SecretId: secretId,
        ClientRequestToken: token,
        SecretString: JSON.stringify(newDict),
        VersionStages: ['AWSPENDING'],
      })
    );
  }

  async setSecret(secretId: string, token: string, pendingDict: any, currentDict: any): Promise<void> {
    // AWS API Key: Nothing to set on "service" side, already created in createSecret.
    return;
  }

  async testSecret(secretId: string, token: string, pendingDict: any): Promise<void> {
    const sts = new STSClient({
      credentials: {
        accessKeyId: pendingDict.accessKeyId,
        secretAccessKey: pendingDict.secretAccessKey,
      },
    });
    await sts.send(new GetCallerIdentityCommand({}));
  }

  async finishSecret(secretId: string, token: string, currentSecret: any): Promise<void> {
    // Standard finish
    await smClient.send(
      new UpdateSecretVersionStageCommand({
        SecretId: secretId,
        VersionStage: 'AWSCURRENT',
        MoveToVersionId: token,
        RemoveFromVersionId: currentSecret.VersionId,
      })
    );

    // Clean up old AWS API Key
    const currentDict = JSON.parse(currentSecret.SecretString || '{}');
    if (currentDict.accessKeyId && currentDict.username) {
      try {
        // Deactivate first
        await iamClient.send(
          new UpdateAccessKeyCommand({
            UserName: currentDict.username,
            AccessKeyId: currentDict.accessKeyId,
            Status: 'Inactive',
          })
        );
        // Then Delete
        await iamClient.send(
          new DeleteAccessKeyCommand({
            UserName: currentDict.username,
            AccessKeyId: currentDict.accessKeyId,
          })
        );
        console.log(`Deleted old Access Key: ${currentDict.accessKeyId}`);
      } catch (e: any) {
        console.warn('Failed to cleanup old API Key:', e.message);
      }
    }
  }
}
