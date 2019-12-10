import { getConfig, getConfigWithProjectRefs } from '@airbnb/config-typescript';
import { getSettings } from '@airbnb/nimbus-common';

const { context } = process.beemo;
const { buildFolder, srcFolder, testFolder, typesFolder, node, react, library } = getSettings();

export default context.args.referenceWorkspaces
  ? getConfigWithProjectRefs({
      node,
      react,
    })
  : getConfig({
      buildFolder,
      includeTests: !!context.args.noEmit,
      library,
      node,
      react,
      srcFolder,
      testFolder,
      typesFolder,
      workspaces: context.workspaces,
    });
