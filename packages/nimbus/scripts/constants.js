// https://github.com/lerna/lerna/tree/master/commands/version#readme
exports.LERNA_VERSION_ARGS = [
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
