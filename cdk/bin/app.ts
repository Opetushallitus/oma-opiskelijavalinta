#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LoadtestStack } from '../lib/loadtest-stack';

const app = new cdk.App();

new LoadtestStack(app, 'LoadtestStack', {
  env: { region: 'eu-west-1' },
});
