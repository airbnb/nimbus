#!/usr/bin/env node

const chalk = require('chalk');
const execa = require('execa');

let remoteHead = 'ORIG_HEAD';
let branchHead = 'HEAD';

// Husky integration
if (process.env.HUSKY_GIT_PARAMS) {
  const parts = process.env.HUSKY_GIT_PARAMS.split(' ');

  if (parts.length >= 2) {
    [remoteHead, branchHead] = parts;
  }
}

execa('git', ['diff-tree', '-r', '--name-only', remoteHead, branchHead])
  .then(({ stdout: files }) => {
    if (files.includes('yarn.lock')) {
      console.log(
        '\n ',
        chalk.yellow('⚠️  Node module changes detected. Please run `yarn install`.'),
        ' \n',
      );
    } else if (files.includes('package-lock.json') || files.includes('npm-shrinkwrap.json')) {
      console.log(
        '\n ',
        chalk.yellow('⚠️  Node module changes detected. Please run `npm install && npm prune`.'),
        ' \n',
      );
    }
  })
  .catch((error) => {
    console.log('\n ', chalk.red(`🛑  Failed to detect module changes: ${error.message}`), ' \n');
  });
