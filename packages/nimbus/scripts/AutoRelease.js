const { Script } = require('@beemo/core');
const { LERNA_VERSION_ARGS } = require('./constants');

// Primarily used within CI jobs
module.exports = class AutoReleaseScript extends Script {
  blueprint() {
    return {};
  }

  bootstrap() {
    this.task('Setting git environment variables', this.setGitEnvVars);
    this.task('Bumping package versions', this.versionPackages);
    this.task('Publishing packages to NPM', this.publishPackages);
  }

  // https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables
  async setGitEnvVars() {
    const { env } = process;
    let name = '';
    let email = '';

    try {
      const gitName = await this.executeCommand('git', ['config', '--get', 'user.name']);

      if (gitName.stdout) {
        name = gitName.stdout;
      }

      const gitEmail = await this.executeCommand('git', ['config', '--get', 'user.email']);

      if (gitEmail.stdout) {
        email = gitEmail.stdout;
      }
    } catch (error) {
      name = env.GITHUB_USER || 'Airbnb Bot';
      email = env.GITHUB_EMAIL || 'airbnb-cli-bot@airbnb.com';
    }

    // Required by Lerna
    if (env.GITHUB_TOKEN) {
      env.GH_TOKEN = env.GITHUB_TOKEN;
    }

    Object.assign(process.env, {
      GIT_AUTHOR_NAME: name,
      GIT_AUTHOR_EMAIL: email,
      GIT_COMMITTER_NAME: name,
      GIT_COMMITTER_EMAIL: email,
      ...env,
      GIT_ASKPASS: 'echo',
      GIT_TERMINAL_PROMPT: 0,
    });
  }

  // https://github.com/lerna/lerna/tree/master/commands/version#readme
  versionPackages() {
    return this.handleCommand(this.executeCommand('lerna', LERNA_VERSION_ARGS));
  }

  // https://github.com/lerna/lerna/tree/master/commands/publish#readme
  publishPackages() {
    return this.handleCommand(
      this.executeCommand('lerna', [
        'publish',
        'from-git',
        '--yes',
        // Run pre and post scripts in each package if available
        '--require-scripts',
      ]),
    );
  }

  handleCommand(promise) {
    return promise
      .then(response => {
        const out = response.stdout.trim();

        if (out) {
          this.tool.log(out);
        }

        return response;
      })
      .catch(error => {
        this.tool.log.error(error.stderr);

        throw error;
      });
  }
};
