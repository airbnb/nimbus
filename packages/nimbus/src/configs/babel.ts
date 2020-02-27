import { getConfig } from '@airbnb/config-babel';
import { getSettings } from '@airbnb/nimbus-common';

const { context, tool } = process.beemo;
const { graphql, library, next, node, react, env } = getSettings();

export default getConfig({
  env,
  esm: Boolean(context.args.esm || process.env.ESM),
  graphql,
  library,
  next,
  node,
  react,
  typescript: tool.isPluginEnabled('driver', 'typescript'),
});
