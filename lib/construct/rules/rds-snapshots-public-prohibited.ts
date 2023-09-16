import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface RdsSnapshotsPublicProhibitedProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class RdsSnapshotsPublicProhibitedConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: RdsSnapshotsPublicProhibitedProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    const rdsSnapshotsPublicProhibitedRule = new config.ManagedRule(
      this,
      'RdsSnapshotsPublicProhibitedRule',
      {
        configRuleName: 'RdsSnapshotsPublicProhibitedRule',
        identifier:
          config.ManagedRuleIdentifiers.RDS_SNAPSHOTS_PUBLIC_PROHIBITED,
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const rdsSnapshotsPublicProhibitedRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'RdsSnapshotsPublicProhibitedRuleRemediation',
        {
          configRuleName: rdsSnapshotsPublicProhibitedRule.configRuleName,
          targetId: 'AWSSupport-ModifyRDSSnapshotPermission',
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
            SnapshotIdentifiers: {
              ResourceValue: {
                Value: 'RESOURCE_ID',
              },
            },
            Private: {
              StaticValue: {
                Values: ['Yes'],
              },
            },
            AutomationAssumeRole: {
              StaticValue: {
                Values: [props.ssmAutomationRole.roleArn],
              },
            },

            AccountIds: {
              StaticValue: {
                Values: [],
              },
            },

            AccountPermissionOperation: {
              StaticValue: {
                Values: [],
              },
            },
          },
        },
      );
  }
}
