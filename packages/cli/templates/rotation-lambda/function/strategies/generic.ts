import {
  PutSecretValueCommand,
  GetRandomPasswordCommand,
  UpdateSecretVersionStageCommand,
} from '@aws-sdk/client-secrets-manager';
import {RotationStrategy, smClient} from '../common.js';

export class GenericStrategy implements RotationStrategy {
  async createSecret(secretId: string, token: string, currentDict: any): Promise<void> {
    const passwordRes = await smClient.send(
      new GetRandomPasswordCommand({PasswordLength: 32, ExcludeCharacters: '/@"\'\\'})
    );
    const newDict = {...currentDict, value: passwordRes.RandomPassword};

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
    // Generic secret: nothing to set on external service
    return;
  }

  async testSecret(secretId: string, token: string, pendingDict: any): Promise<void> {
    // Generic secret: nothing to test
    return;
  }

  async finishSecret(secretId: string, token: string, currentSecret: any): Promise<void> {
    await smClient.send(
      new UpdateSecretVersionStageCommand({
        SecretId: secretId,
        VersionStage: 'AWSCURRENT',
        MoveToVersionId: token,
        RemoveFromVersionId: currentSecret.VersionId,
      })
    );
  }
}
