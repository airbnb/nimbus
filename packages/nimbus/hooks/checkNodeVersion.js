#!/usr/bin/env node

const chalk = require('chalk');
const execa = require('execa');
const { getPackage } = require('@airbnb/nimbus-common');

// Only run if the engines block is defined
if (getPackage().engines) {
  execa('check-node-version', ['--package'], { preferLocal: true }).catch(error => {
    console.error();
    console.error(chalk.red(error.stderr.trim()));
    console.error();
    console.error(chalk.yellow(error.stdout.trim()));
    console.error();
  });
}
