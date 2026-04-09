#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LoadtestStack } from '../lib/loadtest-stack';

const app = new cdk.App();

const environmentName = app.node.tryGetContext('environment') || 'pallero';

new LoadtestStack(app, 'oma-opiskelijavalinta-LoadtestStack', {
  env: { region: 'eu-west-1' },
  environmentName,
});
