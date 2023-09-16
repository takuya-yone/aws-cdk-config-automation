import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_ssmincidents as ssmincidents } from 'aws-cdk-lib';

import { ConfigAutomationIamConstruct } from '../construct/iam-role';
import { RestrictedSSHConstruct } from '../construct/rules/restricted-ssh';
import { RestrictedRDPConstruct } from '../construct/rules/restricted-rdp';
import { RestrictedCommonPortsConstruct } from '../construct/rules/restricted-common-ports';

export class ConfigAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const configAutomationIamConstruct = new ConfigAutomationIamConstruct(
      this,
      'ConfigAutomationIamConstruct',
    );

    const restrictedSSHConstruct = new RestrictedSSHConstruct(
      this,
      'RestrictedSSHConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );

    const restrictedRDPConstruct = new RestrictedRDPConstruct(
      this,
      'RestrictedRDPConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );

    const restrictedCommonPortsConstruct = new RestrictedCommonPortsConstruct(
      this,
      'RestrictedCommonPortsConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
  }
}
