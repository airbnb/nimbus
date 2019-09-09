/* eslint-disable no-param-reassign */
// @ts-check

const fs = require('fs');
const path = require('path');
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
  const paths = workspaces.map(p => p.replace('./', ''));

  return paths.length === 1 ? `${paths[0]}/` : `{${paths.join(',')}}/`;
}

/**
 * @param { import("@beemo/core").default } tool
 */
module.exports = function cli(tool) {
  const { buildFolder, docsFolder, srcFolder, testFolder, typesFolder } = getSettings();
  const usingBabel = tool.isPluginEnabled('driver', 'babel');
  const usingPrettier = tool.isPluginEnabled('driver', 'prettier');
  const usingTypeScript = tool.isPluginEnabled('driver', 'typescript');
  const workspaces = tool.getWorkspacePaths({ relative: true });
  const pathPrefix = workspaces.length ? createWorkspacesGlob(workspaces) : '';
  const exts = usingTypeScript ? ['.ts', '.tsx', '.js', '.jsx'] : ['.js', '.jsx'];

  /**
   * BABEL
   * - Add default extensions.
   * - Add source and output dirs by default.
   */
  tool.onRunDriver.listen(context => {
    if (!context.args.extensions) {
      context.addOption('--extensions', exts.join(','));
    }

    if (hasNoPositionalArgs(context, 'babel')) {
      context.addArg(`./${srcFolder}`);
      context.addOption('--out-dir', context.args.esm ? './esm' : `./${buildFolder}`);
    }
  }, 'babel');

  /**
   * ESLINT
   * - Add default extensions.
   * - Lint source and test folders by default.
   */
  tool.onRunDriver.listen((context, driver) => {
    context.addOptions(['--color']);

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

  // Create a specialized tsconfig for ESLint when using workspaces
  tool.getPlugin('driver', 'eslint').onCreateConfigFile.listen(context => {
    if (workspaces.length === 0) {
      return;
    }

    const configPath = path.join(process.cwd(), 'tsconfig.eslint.json');
    const include = [`${typesFolder}/**/*`];

    workspaces.forEach(wsPath => {
      include.push(
        path.join(wsPath, `${srcFolder}/**/*`),
        path.join(wsPath, `${testFolder}/**/*`),
        path.join(wsPath, `${typesFolder}/**/*`),
      );
    });

    fs.writeFileSync(
      configPath,
      JSON.stringify({
        extends: './tsconfig.options.json',
        include,
      }),
      'utf8',
    );

    context.addConfigPath('eslint', configPath);
  });

  /**
   * JEST
   * - Set common arguments. Include more during code coverage.
   * - Set environment variables by default.
   */
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

  /**
   * PRETTIER
   * - Always write files.
   * - Glob a ton of files by default.
   */
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

  /**
   * TYPESCRIPT
   * - Pass Nimbus settings to the TS driver options.
   */
  tool.onRunDriver.listen((context, driver) => {
    /** @type { import("@beemo/driver-typescript").default } */
    // @ts-ignore
    const tsDriver = driver;

    tsDriver.options.buildFolder = buildFolder;
    tsDriver.options.srcFolder = srcFolder;
    tsDriver.options.testsFolder = testFolder;
    tsDriver.options.typesFolder = typesFolder;
  }, 'typescript');

  /**
   * WEBPACK
   * - Set common and custom arguments.
   * - Handle Bable and TS integration.
   */
  tool.onRunDriver.listen((context, driver) => {
    context.addOptions(['--colors', '--progress', '--bail']);

    if (usingBabel) {
      driver.options.dependencies.push('babel');

      // Babel 7.5 handles dynamic imports natively, which will break Webpack
      // when transforming to `commonjs`. So always force Babel to ESM mode.
      process.env.ESM = 'true';
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
