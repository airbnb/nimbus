/* eslint-disable import/no-dynamic-require */

const fs = require('fs');
const { getSettings, fromRoot } = require('@airbnb/nimbus-common');

// Import a custom setup file from the consumer
const { testFolder } = getSettings();
const jsSetup = fromRoot(`./${testFolder}/setup.js`);
const tsSetup = fromRoot(`./${testFolder}/setup.ts`);

if (fs.existsSync(tsSetup)) {
  require(tsSetup);
} else if (fs.existsSync(jsSetup)) {
  require(jsSetup);
}
