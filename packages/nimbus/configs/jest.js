// @ts-check

const { getConfig } = require('@airbnb/config-jest');
const { getSettings } = require('@airbnb/nimbus-common');

const { coverage, graphql, react, srcFolder, testFolder } = getSettings();

module.exports = getConfig({
  srcFolder,
  testFolder,
  graphql,
  react,
  threshold: coverage,
  workspaces: process.beemo.tool.getWorkspacePaths({ relative: true }),
});
