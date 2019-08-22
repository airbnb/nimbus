const AutoReleaseScript = require('./AutoRelease');
const { LERNA_VERSION_ARGS } = require('./constants');

module.exports = class GraduateScript extends AutoReleaseScript {
  versionPackages() {
    return this.handleCommand(
      this.executeCommand('lerna', [
        ...LERNA_VERSION_ARGS,
        // Graduate pre-release versioned packages to stable versions
        '--conventional-graduate',
      ]),
    );
  }
};
