import {
  PutSecretValueCommand,
  GetRandomPasswordCommand,
  UpdateSecretVersionStageCommand,
} from '@aws-sdk/client-secrets-manager';
import {Client as PgClient} from 'pg';
import {RotationStrategy, smClient} from '../common.js';

export class RdsPostgresStrategy implements RotationStrategy {
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
    const client = new PgClient({
      host: currentDict.host,
      port: currentDict.port,
      user: currentDict.username,
      password: currentDict.password,
      database: currentDict.dbname,
      ssl: {rejectUnauthorized: false},
    });
    await client.connect();
    await client.query(`ALTER USER "${currentDict.username}" WITH PASSWORD '${pendingDict.password}'`);
    await client.end();
  }

  async testSecret(secretId: string, token: string, pendingDict: any): Promise<void> {
    const client = new PgClient({
      host: pendingDict.host,
      port: pendingDict.port,
      user: pendingDict.username,
      password: pendingDict.password,
      database: pendingDict.dbname,
      ssl: {rejectUnauthorized: false},
    });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
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
