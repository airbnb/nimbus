import Octokit, { Octokit as OctokitType } from '@octokit/rest';
import { VERSION } from '../constants';

// Types do not match actual package implementation
const Octocat = (Octokit as unknown) as typeof OctokitType;

export default function createGitHubClient(token?: string): OctokitType {
  const { GITHUB_TOKEN, GHE_API_URL, GHE_VERSION } = process.env;
  const options: OctokitType.Options = {
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
    Octocat.plugin(require(`@octokit/plugin-enterprise-rest/ghe-${GHE_VERSION}`));
  }

  return new Octocat(options);
}
