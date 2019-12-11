// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('../package.json');

export const VERSION = version;

export const BANNER = ` _  _  ____  __  __  ____  __  __  ___
( \\( )(_  _)(  \\/  )(  _ \\(  )(  )/ __)
 )  (  _)(_  )    (  ) _ < )(__)( \\__ \\ v${VERSION}
(_)\\_)(____)(_/\\/\\_)(____/ (____) (___/
`;

// https://github.com/lerna/lerna/tree/master/commands/version#readme
export const LERNA_VERSION_ARGS = [
  'version',
  '--yes',
  // Only run on master
  '--allow-branch',
  'master',
  // Use the Beemo conventional commit preset
  '--conventional-commits',
  '--changelog-preset',
  'conventional-changelog-beemo',
  // Create a GitHub release
  '--create-release',
  'github',
  // Push changes to git
  '--push',
  // Alter commit message to skip CI
  '--message',
  'Release [ci skip]',
];
