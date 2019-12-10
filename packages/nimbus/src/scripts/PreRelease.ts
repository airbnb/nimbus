import AutoReleaseScript from './AutoRelease';

export default class PreReleaseScript extends AutoReleaseScript {
  bootstrap() {
    this.task('Bumping package versions', this.versionPackages);
    this.task('Publishing packages to NPM', this.publishPackages);
  }

  versionPackages() {
    return this.handleCommand(
      this.executeCommand('lerna', [
        'version',
        // Use the Beemo conventional commit preset
        '--conventional-commits',
        '--changelog-preset',
        'conventional-changelog-beemo',
        // Push changes to git
        '--push',
        // Alter commit message to skip CI
        '--message',
        'Pre-release [ci skip]',
      ]),
    );
  }
}
