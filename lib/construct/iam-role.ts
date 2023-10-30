import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export class ConfigAutomationIamConstruct extends Construct {
  public ssmAutomationRole: iam.Role;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    const RestrictedCommonPortsPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            'ec2:RevokeSecurityGroupIngress',
            'ec2:RevokeSecurityGroupEgress',
            'ec2:DescribeSecurityGroups',
          ],
          resources: ['arn:aws:ec2:*:*:security-group/*'],
        }),
      ],
    });

    const EnableEbsEncryptionByDefaultPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            'ec2:EnableEbsEncryptionByDefault',
            'ec2:GetEbsEncryptionByDefault',
          ],
          resources: ['*'],
        }),
      ],
    });

    const RdsSnapshotsPublicProhibitedPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['rds:ModifyDBSnapshotAttribute', 'rds:DescribeDBSnapshots'],
          resources: ['arn:aws:rds:*:*:db:*', 'arn:aws:rds:*:*:snapshot:*'],
        }),
      ],
    });

    const DisablePublicAccessToRDSInstancePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['rds:DescribeDBInstances', 'rds:ModifyDBInstance'],
          resources: [
            'arn:aws:rds:*:*:db:*',
            'arn:aws:rds:*:*:og:*',
            'arn:aws:rds:*:*:pg:*',
            'arn:aws:rds:*:*:secgrp:*',
          ],
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
        RestrictedCommonPortsPolicy,
        EnableEbsEncryptionByDefaultPolicy,
        RdsSnapshotsPublicProhibitedPolicy,
        DisablePublicAccessToRDSInstancePolicy,
      },
    });
  }
}
