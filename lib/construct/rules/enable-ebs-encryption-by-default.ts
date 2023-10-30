import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface EnableEbsEncryptionByDefaultConstructProps
  extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class EnableEbsEncryptionByDefaultConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: EnableEbsEncryptionByDefaultConstructProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    ////////// Parameters //////////
    const isEnableEbsEncryptionByDefaultConstructAutoRepaier = new CfnParameter(
      this,
      'IsEnableEbsEncryptionByDefaultConstructAutoRepaier',
      {
        default: 'false',
        allowedValues: ['true', 'false'],
      },
    );

    ////////// Rules //////////

    const enableEbsEncryptionByDefaultRule = new config.ManagedRule(
      this,
      'EnableEbsEncryptionByDefaultRule',
      {
        configRuleName: 'EnableEbsEncryptionByDefaultRule',
        identifier: config.ManagedRuleIdentifiers.EC2_EBS_ENCRYPTION_BY_DEFAULT,
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const enableEbsEncryptionByDefaultRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'EnableEbsEncryptionByDefaultRuleRemediation',
        {
          configRuleName: enableEbsEncryptionByDefaultRule.configRuleName,
          targetId: 'AWSConfigRemediation-EnableEbsEncryptionByDefault',
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
