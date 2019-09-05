const path = require('path');
const {
  EXTS,
  EXTS_GROUP,
  ASSET_EXT_PATTERN,
  GQL_EXT_PATTERN,
} = require('@airbnb/nimbus-common/constants');

module.exports = {
  root: true,

  parser: 'babel-eslint',

  parserOptions: {
    requireConfigFile: false,
  },

  extends: ['airbnb', 'plugin:jsx-a11y/recommended'],

  plugins: ['import', 'react', 'react-hooks'],

  globals: {
    __DEV__: 'readonly',
    jsdom: 'readonly',
    newrelic: 'readonly',
  },

  env: {
    browser: true,
    node: false,
  },

  reportUnusedDisableDirectives: true,

  settings: {
    propWrapperFunctions: ['forbidExtraProps', 'exact', 'Object.freeze'],
    'import/ignore': ['node_modules', '\\.json$', ASSET_EXT_PATTERN.source, GQL_EXT_PATTERN.source],
    'import/extensions': EXTS,
    'import/resolver': {
      node: {
        extensions: EXTS,
      },
      [path.join(__dirname, '../resolvers/graphql.js')]: {
        extensions: ['.gql', '.graphql'],
      },
    },
  },

  rules: {
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
  },

  overrides: [
    {
      files: [`*.test.${EXTS_GROUP}`],
      plugins: ['jest'],
      env: {
        jest: true,
        node: true,
      },
      rules: {
        'max-classes-per-file': 'off',
        'no-magic-numbers': 'off',
        'sort-keys': 'off',

        // JEST
        'jest/expect-expect': 'error',
        'jest/no-disabled-tests': 'error',
        'jest/no-export': 'error',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/no-if': 'error',
        'jest/no-jest-import': 'error',
        'jest/no-standalone-expect': 'error',
        'jest/no-test-callback': 'error',
        'jest/prefer-todo': 'error',
        'jest/prefer-to-be-null': 'error',
        'jest/prefer-to-be-undefined': 'error',
        'jest/prefer-to-have-length': 'error',
        'jest/require-top-level-describe': 'error',
        'jest/valid-expect': 'error',
      },
    },
  ],
};
