// @ts-check

const { IGNORE_PATHS, NODE_TARGET, WEB_TARGET } = require('@airbnb/nimbus-common/constants');

/**
 * @typedef { import("@beemo/driver-babel").BabelConfig } BabelConfig
 * @typedef {string | import("@beemo/driver-babel").PresetEntry} Preset
 * @typedef {string | import("@beemo/driver-babel").PluginEntry} Plugin
 * @typedef {object} ConfigOptions
 * @property {object} [env]
 * @property {boolean} [esm]
 * @property {boolean} [graphql]
 * @property {boolean} [library]
 * @property {boolean} [next]
 * @property {boolean} [node]
 * @property {boolean} [react]
 * @property {boolean} [typescript]
 */

/**
 * Create a root project config for a project.
 *
 * @param {ConfigOptions} options
 * @returns {BabelConfig}
 */
exports.getConfig = function getConfig({
  env = {},
  esm = false,
  graphql = false,
  library = false,
  next = false,
  node = false,
  react = false,
  typescript = false,
}) {
  const envOptions = {
    loose: true,
    modules: esm ? false : 'commonjs',
    shippedProposals: next,
    targets: node ? NODE_TARGET : WEB_TARGET,
    ...env,
  };
  /** @type {Preset[]} */
  const presets = [['@babel/preset-env', envOptions]];
  /** @type {Plugin[]} */
  const plugins = ['babel-plugin-idx', ['babel-plugin-transform-dev', { evaluate: false }]];

  // Flags
  let useNext = next;
  let removePropTypes = false;

  switch (process.env.NODE_ENV) {
    case 'test': {
      envOptions.modules = 'commonjs';
      envOptions.targets = { node: 'current' };
      plugins.push('babel-plugin-dynamic-import-node');
      break;
    }

    case 'development': {
      if (react) {
        plugins.push(
          '@babel/plugin-transform-react-jsx-source',
          '@babel/plugin-transform-react-jsx-self',
        );
      }
      break;
    }

    case 'production':
    default: {
      if (!library && react) {
        plugins.push([
          'babel-plugin-transform-react-remove-prop-types',
          {
            mode: 'remove',
            removeImport: true,
            additionalLibraries: ['airbnb-prop-types'],
            ignoreFilenames: ['node_modules'],
          },
        ]);

        removePropTypes = true;
      }
      break;
    }
  }

  if (graphql) {
    plugins.push('babel-plugin-graphql-tag');
  }

  if (react) {
    presets.push('@babel/preset-react');
  }

  if (typescript) {
    useNext = true;
    presets.push('@babel/preset-typescript');

    if (!removePropTypes) {
      plugins.push('babel-plugin-typescript-to-proptypes');
    }
  }

  if (useNext) {
    plugins.push(
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-catch-binding',
    );
  }

  return {
    ignore: [...IGNORE_PATHS, '__tests__', '__mocks__'],
    plugins,
    presets,
  };
};
