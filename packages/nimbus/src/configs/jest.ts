import { getConfig } from '@airbnb/config-jest';
import { getSettings } from '@airbnb/nimbus-common';

const { coverage, graphql, react, srcFolder, testFolder } = getSettings();

export default getConfig({
  srcFolder,
  testFolder,
  graphql,
  react,
  threshold: coverage,
  workspaces: process.beemo.tool.getWorkspacePaths({ relative: true }),
});
