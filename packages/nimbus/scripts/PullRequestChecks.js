const { Script } = require('@beemo/core');
const Octokit = require('@octokit/rest');
const { checkCommitFormat } = require('conventional-changelog-beemo');
const pkg = require('../package.json');

const { TRAVIS_PULL_REQUEST, TRAVIS_PULL_REQUEST_SLUG } = process.env;

// Primarily used within CI jobs
module.exports = class PullRequestChecksScript extends Script {
  blueprint() {
    return {};
  }

  bootstrap() {
    if (TRAVIS_PULL_REQUEST === 'false') {
      return;
    }

    const [owner, repo] = TRAVIS_PULL_REQUEST_SLUG.split('/');

    this.owner = owner;
    this.repo = repo;
    this.client = this.createGitHubClient();

    this.task('Checking for invalid lock file changes', this.checkForInvalidLocks);
    this.task('Checking pull request title', this.checkForConventionalTitle);
  }

  createGitHubClient() {
    const { GITHUB_TOKEN, GHE_API_URL, GHE_VERSION } = process.env;
    const options = {
      userAgent: `Nimbus v${pkg.version}`,
    };

    if (GITHUB_TOKEN) {
      options.auth = `token ${GITHUB_TOKEN}`;
    }

    if (GHE_API_URL) {
      options.baseUrl = GHE_API_URL;
    }

    if (GHE_VERSION) {
      // eslint-disable-next-line
      Octokit.plugin(require(`@octokit/plugin-enterprise-rest/ghe-${GHE_VERSION}`));
    }

    return new Octokit(options);
  }

  async checkForInvalidLocks() {
    const { data: files } = await this.client.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: TRAVIS_PULL_REQUEST,
    });

    const fileNames = files.map(file => file.filename);

    if (fileNames.includes('package-lock.json') && !fileNames.includes('package.json')) {
      throw new Error('Your PR contains changes to package-lock.json, but not package.json.');
    } else if (fileNames.includes('npm-shrinkwrap.json') && !fileNames.includes('package.json')) {
      throw new Error('Your PR contains changes to npm-shrinkwrap.json, but not package.json.');
    } else if (fileNames.includes('yarn.lock') && !fileNames.includes('package.json')) {
      throw new Error('Your PR contains changes to yarn.lock, but not package.json.');
    }
  }

  async checkForConventionalTitle() {
    const { data: pr } = await this.client.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: TRAVIS_PULL_REQUEST,
    });

    if (!checkCommitFormat(pr.title)) {
      throw new Error(
        'Pull request title requires a conventional changelog prefix. More information: https://github.com/beemojs/conventional-changelog-beemo#commit-message-format',
      );
    }
  }
};
