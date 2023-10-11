import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

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

    // const enableAutomaticRepaier = new CfnParameter(
    //   this,
    //   'EnableAutomaticRepaier',
    //   {
    //     default: 'false',
    //     allowedValues: ['true', 'false'],
    //   },
    // );

    ////////// Rules //////////

    const restrictedSSHConstruct = new RestrictedSSHConstruct(
      this,
      'RestrictedSSHConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
    // }

    const restrictedRDPConstruct = new RestrictedRDPConstruct(
      this,
      'RestrictedRDPConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );
    // }

    const restrictedCommonPortsConstruct = new RestrictedCommonPortsConstruct(
      this,
      'RestrictedCommonPortsConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );

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
