import Octokit from '@octokit/rest';
import { VERSION } from '../constants';

export default function createGitHubClient(token?: string): Octokit {
  const { GITHUB_TOKEN, GHE_API_URL, GHE_VERSION } = process.env;
  const options: Octokit.Options = {
    userAgent: `Nimbus v${VERSION}`,
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
}
