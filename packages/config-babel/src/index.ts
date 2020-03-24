import { BabelConfig } from '@beemo/driver-babel';
import { NimbusEnvSetting, IGNORE_PATHS, NODE_TARGET, WEB_TARGET } from '@airbnb/nimbus-common';

interface BabelOptions {
  env?: NimbusEnvSetting;
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
  const envOptions = {
    loose: true,
    modules: esm ? false : 'commonjs',
    shippedProposals: next,
    targets: node ? NODE_TARGET : WEB_TARGET,
    ...env,
  };
  const presets: NonNullable<BabelConfig['presets']> = [['@babel/preset-env', envOptions]];
  const plugins: NonNullable<BabelConfig['plugins']> = [
    ['babel-plugin-transform-dev', { evaluate: false }],
  ];

  // https://babeljs.io/blog/2020/03/16/7.9.0#highlights
  // @ts-ignore Not typed upstream
  envOptions.bugfixes = typeof envOptions.targets === 'object' && !!envOptions.targets?.esmodules;

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
    plugins.push('@babel/plugin-proposal-class-properties');
  }

  return {
    ignore: [...IGNORE_PATHS, '__tests__', '__mocks__'],
    plugins,
    presets,
  };
}
