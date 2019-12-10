import { BabelConfig } from '@beemo/driver-babel';
import { IGNORE_PATHS, NODE_TARGET, WEB_TARGET } from '@airbnb/nimbus-common/lib/constants';

interface BabelEnvOptions {
  loose?: boolean;
  modules?: string | boolean;
  shippedProposals?: boolean;
  [option: string]: unknown;
}

interface BabelOptions {
  env?: BabelEnvOptions;
  esm?: boolean;
  graphql?: boolean;
  library?: boolean;
  next?: boolean;
  node?: boolean;
  react?: boolean;
  typescript?: boolean;
}

/**
 * Create a root project config for a project.
 */
// eslint-disable-next-line
export function getConfig({
  env = {},
  esm = false,
  graphql = false,
  library = false,
  next = false,
  node = false,
  react = false,
  typescript = false,
}: BabelOptions): BabelConfig {
  const envOptions: BabelEnvOptions = {
    loose: true,
    modules: esm ? false : 'commonjs',
    shippedProposals: next,
    targets: node ? NODE_TARGET : WEB_TARGET,
    ...env,
  };
  const presets: BabelConfig['presets'] = [['@babel/preset-env', envOptions]];
  const plugins: BabelConfig['plugins'] = [
    'babel-plugin-idx',
    ['babel-plugin-transform-dev', { evaluate: false }],
  ];

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
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    );
  }

  return {
    ignore: [...IGNORE_PATHS, '__tests__', '__mocks__'],
    plugins,
    presets,
  };
}
