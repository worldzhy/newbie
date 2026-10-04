/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'aws-secrets-manager-rotation',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    // Create the Secrets Manager polling Lambda function
    const rotationFunction = new sst.aws.Function('SecretsManagerRotation', {
      handler: 'function/index.handler',
      runtime: 'nodejs20.x',
      timeout: '30 seconds',
      memory: '512 MB',
      environment: {
        NODE_ENV: 'production',
      },
      permissions: [
        {
          actions: [
            'secretsmanager:DescribeSecret',
            'secretsmanager:GetSecretValue',
            'secretsmanager:PutSecretValue',
            'secretsmanager:UpdateSecretVersionStage',
            'secretsmanager:GetRandomPassword',
          ],
          resources: ['*'],
        },
      ],
    });

    // Add a resource policy to the Lambda allowing Secrets Manager to invoke it
    new aws.lambda.Permission('SecretsManagerInvokePermission', {
      action: 'lambda:InvokeFunction',
      function: rotationFunction.name,
      principal: 'secretsmanager.amazonaws.com',
      statementId: 'SecretsManagerAccess',
    });

    return {
      lambdaArn: rotationFunction.arn,
      lambdaName: rotationFunction.name,
    };
  },
});
