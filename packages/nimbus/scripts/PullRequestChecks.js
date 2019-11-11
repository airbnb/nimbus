const path = require('path');
const { Script } = require('@beemo/core');
const { checkCommitFormat } = require('conventional-changelog-beemo');
const createGitHubClient = require('./helpers/createGitHubClient');

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
    this.client = createGitHubClient();

    this.task('Checking for invalid lock file changes', this.checkForInvalidLocks);
    this.task('Checking pull request title', this.checkForConventionalTitle);
  }

  async checkForInvalidLocks() {
    const { data: files } = await this.client.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: TRAVIS_PULL_REQUEST,
    });

    const fileNames = new Set(files.map(file => path.basename(file.filename)));
    const hasPackageChanges = fileNames.has('package.json');

    // this.tool.log('Changed files: %s', Array.from(fileNames).join(', '));

    if (fileNames.has('package-lock.json') && !hasPackageChanges) {
      throw new Error('Your PR contains changes to package-lock.json, but not package.json.');
    } else if (fileNames.has('npm-shrinkwrap.json') && !hasPackageChanges) {
      throw new Error('Your PR contains changes to npm-shrinkwrap.json, but not package.json.');
    } else if (fileNames.has('yarn.lock') && !hasPackageChanges) {
      throw new Error('Your PR contains changes to yarn.lock, but not package.json.');
    }
  }

  async checkForConventionalTitle() {
    const { data: pr } = await this.client.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: TRAVIS_PULL_REQUEST,
    });

    // this.tool.log('PR title: %s', pr.title);

    if (!checkCommitFormat(pr.title)) {
      throw new Error(
        'Pull request title requires a conventional changelog prefix. More information: https://github.com/beemojs/conventional-changelog-beemo#commit-message-format',
      );
    }
  }
};
