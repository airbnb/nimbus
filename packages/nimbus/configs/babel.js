// @ts-check

const { getConfig } = require('@airbnb/config-babel');
const { getSettings } = require('@airbnb/nimbus-common');

const { context, tool } = process.beemo;
const { graphql, library, next, node, react, env } = getSettings();

module.exports = getConfig({
  env,
  esm: !!(context.args.esm || process.env.ESM),
  graphql,
  library,
  next,
  node,
  react,
  typescript: tool.isPluginEnabled('driver', 'typescript'),
});
