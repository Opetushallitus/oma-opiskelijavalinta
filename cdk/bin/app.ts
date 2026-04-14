#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LoadtestStack } from '../lib/loadtest-stack';

const app = new cdk.App();

const environmentName = app.node.tryGetContext('environment') || 'pallero';

new LoadtestStack(app, 'oma-opiskelijavalinta-LoadtestStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environmentName,
});
