/* eslint-disable no-param-reassign */
// @ts-check

const { getSettings } = require('@airbnb/nimbus-common');

/**
 * @param { import("@beemo/core").Context } context
 * @param {string?} name
 * @returns {boolean}
 */
function hasNoPositionalArgs(context, name) {
  const args = context.args._;

  return args.length === 0 || (args.length === 1 && args[0] === name);
}

/**
 * @param {string[]} workspaces
 * @returns {string}
 */
function createWorkspacesGlob(workspaces) {
  const paths = workspaces.map(path => path.replace('./', ''));

  return paths.length === 1 ? `${paths[0]}/` : `{${paths.join(',')}}/`;
}

/**
 * @param { import("@beemo/core").default } tool
 */
module.exports = function cli(tool) {
  const { buildFolder, docsFolder, srcFolder, testFolder } = getSettings();
  const usingBabel = tool.isPluginEnabled('driver', 'babel');
  const usingPrettier = tool.isPluginEnabled('driver', 'prettier');
  const usingTypeScript = tool.isPluginEnabled('driver', 'typescript');
  const workspaces = tool.getWorkspacePaths({ relative: true });
  const pathPrefix = workspaces.length ? createWorkspacesGlob(workspaces) : '';
  const exts = usingTypeScript ? ['.ts', '.tsx', '.js', '.jsx'] : ['.js', '.jsx'];

  // Babel
  tool.onRunDriver.listen(context => {
    if (!context.args.extensions) {
      context.addOption('--extensions', exts.join(','));
    }

    if (hasNoPositionalArgs(context, 'babel')) {
      context.addArg(`./${srcFolder}`);
      context.addOption('--out-dir', context.args.esm ? './esm' : `./${buildFolder}`);
    }
  }, 'babel');

  // ESLint
  tool.onRunDriver.listen((context, driver) => {
    context.addOptions(['--color', '--report-unused-disable-directives']);

    if (!context.args.ext) {
      context.addOption('--ext', exts.join(','));
    }

    if (hasNoPositionalArgs(context, 'eslint')) {
      context.addArgs([`./${pathPrefix}${srcFolder}`, `./${pathPrefix}${testFolder}`]);
    }

    if (usingPrettier) {
      driver.options.dependencies.push('prettier');
    }
  }, 'eslint');

  // Jest
  tool.onRunDriver.listen((context, driver) => {
    context.addOptions(['--colors']);

    if (context.args.coverage) {
      context.addOptions(['--logHeapUsage', '--detectOpenHandles']);
    }

    if (usingTypeScript) {
      driver.options.dependencies.push('typescript');
    }

    driver.options.env.NODE_ENV = 'test';
    driver.options.env.TZ = 'UTC';
  }, 'jest');

  // Prettier
  tool.onRunDriver.listen(context => {
    context.addOption('--write');

    if (hasNoPositionalArgs(context, 'prettier')) {
      context.addArgs([
        `./${pathPrefix}{bin,hooks,scripts,${srcFolder},${testFolder}}/**/*.{ts,tsx,js,jsx,scss,css,gql,graphql,yml,yaml,md}`,
        `./${docsFolder}/**/*.md`,
        './*.{md,json}',
      ]);
    }
  }, 'prettier');

  // Webpack
  tool.onRunDriver.listen((context, driver) => {
    context.addOptions(['--colors', '--progress', '--bail']);

    if (usingBabel) {
      driver.options.dependencies.push('babel');
    }

    if (usingTypeScript) {
      driver.options.dependencies.push('typescript');
    }

    // Since webpack config uses references and doesn't have access to Beemo,
    // we need to set these environment variables for easy access.
    if (context.args.analyze) {
      driver.options.env.WEBPACK_ANALYZE = context.args.analyze;
    }

    if (context.args.sourceMaps) {
      driver.options.env.SOURCE_MAPS = context.args.sourceMaps;
    }
  }, 'webpack');
};
