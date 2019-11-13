const Octokit = require('@octokit/rest');
const pkg = require('../../package.json');

const { GITHUB_TOKEN, GHE_API_URL, GHE_VERSION } = process.env;

module.exports = function createGitHubClient(token = GITHUB_TOKEN) {
  const options = {
    userAgent: `Nimbus v${pkg.version}`,
  };

  if (token) {
    options.auth = `token ${token}`;
  }

  if (GHE_API_URL) {
    options.baseUrl = GHE_API_URL;
  }

  if (GHE_VERSION) {
    // eslint-disable-next-line
    Octokit.plugin(require(`@octokit/plugin-enterprise-rest/ghe-${GHE_VERSION}`));
  }

  return new Octokit(options);
};
