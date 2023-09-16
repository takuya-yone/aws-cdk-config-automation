import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export class ConfigAutomationIamConstruct extends Construct {
  public ssmAutomationRole: iam.Role;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    const s3AccessPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:*'],
          resources: ['*'],
        }),
      ],
    });

    this.ssmAutomationRole = new iam.Role(this, 'testSsmAutomationRole', {
      roleName: 'TestSsmAutomationRole',
      assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonSSMAutomationRole',
        ),
      ],
      inlinePolicies: {
        // s3AccessPolicy,
      },
    });
  }
}
