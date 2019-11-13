const Octokit = require('@octokit/rest');
const pkg = require('../../package.json');

module.exports = function createGitHubClient(token) {
  const { GITHUB_TOKEN, GHE_API_URL, GHE_VERSION } = process.env;
  const options = {
    userAgent: `Nimbus v${pkg.version}`,
  };

  if (token || GITHUB_TOKEN) {
    options.auth = `token ${token || GITHUB_TOKEN}`;
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
