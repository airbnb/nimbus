const { Script } = require('@beemo/core');
const { createGitHubClient, parseGitRepo } = require('@lerna/github-client');
const { getLastTag, getCommitsSince } = require('@airbnb/nimbus-common/git');
const { LERNA_VERSION_ARGS } = require('./constants');

// Primarily used within CI jobs
module.exports = class AutoReleaseScript extends Script {
  blueprint() {
    return {};
  }

  bootstrap() {
    this.task('Setting git environment variables', this.setGitEnvVars);
    this.task('Getting git commits since last tag', this.getCommitsSinceLastTag);
    this.task('Bumping package versions', this.versionPackages);
    this.task('Publishing packages to NPM', this.publishPackages);
    this.task('Adding label to GitHub PRs', this.addLabelToPRs);
  }

  // https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables
  async setGitEnvVars(context) {
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
      name = 'Airbnb Bot';
      email = 'airbnb-cli-bot@airbnb.com';
    }

    Object.assign(env, {
      GIT_AUTHOR_NAME: name,
      GIT_AUTHOR_EMAIL: email,
      GIT_COMMITTER_NAME: name,
      GIT_COMMITTER_EMAIL: email,
      ...env,
      GIT_ASKPASS: 'echo',
      GIT_TERMINAL_PROMPT: 0,
    });

    context.client = createGitHubClient();
    context.repo = parseGitRepo();
  }

  // Commit looks like:
  // 2c595c5 (HEAD -> refs/heads/master, refs/remotes/origin/master, refs/remotes/origin/HEAD) Docs: Update readme.
  getCommitsSinceLastTag(context) {
    context.commits = [];
    context.prs = [];

    return getLastTag().then(tag => {
      context.lastTag = tag;

      return getCommitsSince(tag).then(commits => {
        commits.forEach(commit => {
          context.commits.push(commit.trim());

          // Extract the PR number if available
          const pr = commit.match(/\(#(\d+)\)/);

          if (pr && pr[1]) {
            context.prs.push(Number(pr[1]));
          }
        });
      });
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

  // https://octokit.github.io/rest.js/#api-Issues-addLabels
  addLabelToPRs(context) {
    return Promise.all(
      context.prs.map(number =>
        context.client.request('POST /repos/:owner/:repo/issues/:number/labels', {
          owner: context.repo.owner,
          repo: context.repo.name,
          number,
          data: ['released'],
        }),
      ),
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
        this.tool.logError(error.stderr);

        throw error;
      });
  }
};
