import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { CfnParameter } from 'aws-cdk-lib';

export interface CreateEncryptedRdsSnapshot extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class CreateEncryptedRdsSnapshotConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CreateEncryptedRdsSnapshot) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);
    ////////// Parameters //////////

    const isCreateEncryptedRdsSnapshotConstructAutoRepaier = new CfnParameter(
      this,
      'IsCreateEncryptedRdsSnapshotConstructAutoRepaier',
      {
        default: 'false',
        allowedValues: ['true', 'false'],
      },
    );

    ////////// Rules //////////
    const createEncryptedRdsSnapshotRule = new config.ManagedRule(
      this,
      'CreateEncryptedRdsSnapshotRule',
      {
        configRuleName: 'CreateEncryptedRdsSnapshotRule',
        identifier: config.ManagedRuleIdentifiers.RDS_SNAPSHOT_ENCRYPTED,
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const CreateEncryptedRdsSnapshotRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'CreateEncryptedRdsSnapshotRuleRemediation',
        {
          configRuleName: createEncryptedRdsSnapshotRule.configRuleName,
          targetId: 'AWS-CreateEncryptedRdsSnapshot',
          targetType: 'SSM_DOCUMENT',
          // targetVersion: '1',

          automatic: false,
          executionControls: {
            ssmControls: {
              concurrentExecutionRatePercentage: 2,
              errorPercentage: 5,
            },
          },
          // maximumAutomaticAttempts: 10,
          parameters: {
            DBInstanceIdentifier: {
              ResourceValue: {
                Value: 'RESOURCE_ID',
              },
            },
            AutomationAssumeRole: {
              StaticValue: {
                Values: [props.ssmAutomationRole.roleArn],
              },
            },
          },
        },
      );
  }
}
