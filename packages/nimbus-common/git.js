// @ts-check

const execa = require('execa');

/**
 * @returns {Promise<string>}
 */
exports.getLastTag = function getLastTag() {
  return execa('git', ['describe', '--tags', '--abbrev=0', '@^']).then(response =>
    response.stdout.trim(),
  );
};

/**
 * @params {string} since
 * @returns {Promise<string[]>}
 */
exports.getCommitsSince = function getCommitsSince(since) {
  return execa('git', ['log', '--oneline', `${since}..@`]).then(response =>
    response.stdout.trim().split('\n'),
  );
};

let commitHash = '';

/**
 * @returns {string}
 */
exports.getCommitHash = function getCommitHash() {
  if (commitHash) {
    return commitHash;
  }

  try {
    commitHash = execa.sync('git', ['rev-parse', '--short=7', 'HEAD']).stdout;
  } catch (error) {
    // Ignore error
  }

  return commitHash;
};
