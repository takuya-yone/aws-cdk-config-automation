import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter, ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_ssmincidents as ssmincidents } from 'aws-cdk-lib';

import { ConfigAutomationIamConstruct } from '../construct/iam-role';
import { RestrictedSSHConstruct } from '../construct/rules/restricted-ssh';
import { RestrictedRDPConstruct } from '../construct/rules/restricted-rdp';
import { RestrictedCommonPortsConstruct } from '../construct/rules/restricted-common-ports';
import { RdsSnapshotsPublicProhibitedConstruct } from '../construct/rules/rds-snapshots-public-prohibited';

export class ConfigAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ////////// IAM Role //////////
    const configAutomationIamConstruct = new ConfigAutomationIamConstruct(
      this,
      'ConfigAutomationIamConstruct',
    );

    const enableAutomaticRepaier = new CfnParameter(
      this,
      'enableAutomaticRepaier',
      {
        default: 'false',
        allowedValues: ['true', 'false'],
      },
    );

    ////////// Parameters //////////
    // const isRestrictedSSHConstruct = new CfnParameter(
    //   this,
    //   'isRestrictedSSHConstruct',
    //   {
    //     default: 'False',
    //     allowedValues: ['True', 'False'],
    //   },
    // );
    // const isRestrictedRDPConstruct = new CfnParameter(
    //   this,
    //   'isRestrictedRDPConstruct',
    //   {
    //     default: 'False',
    //     allowedValues: ['True', 'False'],
    //   },
    // );

    // const isRestrictedCommonPortsConstruct = new CfnParameter(
    //   this,
    //   'isRestrictedCommonPortsConstruct',
    //   {
    //     default: 'False',
    //     allowedValues: ['True', 'False'],
    //   },
    // );

    // const isRdsSnapshotsPublicProhibitedConstruct = new CfnParameter(
    //   this,
    //   'isRdsSnapshotsPublicProhibitedConstruct',
    //   {
    //     default: 'False',
    //     allowedValues: ['True', 'False'],
    //   },
    // );

    ////////// Rules //////////
    // console.log(isRestrictedSSHConstruct.valueAsString);

    // if (isRestrictedSSHConstruct.valueAsString === 'True') {
    const restrictedSSHConstruct = new RestrictedSSHConstruct(
      this,
      'RestrictedSSHConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
    // }

    // if (isRestrictedRDPConstruct.valueAsString === 'True') {
    const restrictedRDPConstruct = new RestrictedRDPConstruct(
      this,
      'RestrictedRDPConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
    // }

    // if (isRestrictedCommonPortsConstruct.valueAsString === 'True') {
    const restrictedCommonPortsConstruct = new RestrictedCommonPortsConstruct(
      this,
      'RestrictedCommonPortsConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
    // }

    // if (isRdsSnapshotsPublicProhibitedConstruct.valueAsString === 'True') {
    const rdsSnapshotsPublicProhibitedConstruct =
      new RdsSnapshotsPublicProhibitedConstruct(
        this,
        'RdsSnapshotsPublicProhibitedConstruct',
        {
          ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
        },
      );
    // }
  }
}
