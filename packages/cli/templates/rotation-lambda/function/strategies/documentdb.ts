import {
  PutSecretValueCommand,
  GetRandomPasswordCommand,
  UpdateSecretVersionStageCommand,
} from '@aws-sdk/client-secrets-manager';
import {MongoClient} from 'mongodb';
import {RotationStrategy, smClient} from '../common.js';

export class DocumentDbStrategy implements RotationStrategy {
  async createSecret(secretId: string, token: string, currentDict: any): Promise<void> {
    const passwordRes = await smClient.send(
      new GetRandomPasswordCommand({
        PasswordLength: 32,
        ExcludeCharacters: '/@"\'\\',
        ExcludePunctuation: true,
      })
    );
    const newDict = {...currentDict, password: passwordRes.RandomPassword};

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
    const url = `mongodb://${currentDict.username}:${currentDict.password}@${currentDict.host}:${currentDict.port}/${currentDict.dbname || 'test'}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
    const client = new MongoClient(url, {
      tlsCAFile: '/opt/rds-combined-ca-bundle.pem',
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    await client.connect();
    const db = client.db(currentDict.dbname || 'test');
    await db.command({
      updateUser: currentDict.username,
      pwd: pendingDict.password,
    });
    await client.close();
  }

  async testSecret(secretId: string, token: string, pendingDict: any): Promise<void> {
    const url = `mongodb://${pendingDict.username}:${pendingDict.password}@${pendingDict.host}:${pendingDict.port}/${pendingDict.dbname || 'test'}?tls=true&tlsAllowInvalidCertificates=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
    const client = new MongoClient(url);
    await client.connect();
    await client.db().command({ping: 1});
    await client.close();
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
