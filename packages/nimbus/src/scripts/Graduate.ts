import { ExecaReturnValue } from 'execa';
import AutoReleaseScript from './AutoRelease';
import { LERNA_VERSION_ARGS } from '../constants';

export default class GraduateScript extends AutoReleaseScript {
  versionPackages(): Promise<ExecaReturnValue> {
    return this.handleCommand(
      this.executeCommand('lerna', [
        ...LERNA_VERSION_ARGS,
        // Graduate pre-release versioned packages to stable versions
        '--conventional-graduate',
      ]),
    );
  }
}
