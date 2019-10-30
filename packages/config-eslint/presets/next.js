const { EXTS_GROUP } = require('@airbnb/nimbus-common/constants');

module.exports = {
  plugins: ['promise', 'unicorn'],

  rules: {
    // Not enabled in Airbnb
    'default-param-last': 'warn',
    'func-name-matching': [
      'error',
      'always',
      {
        considerPropertyDescriptor: true,
        includeCommonJSModuleExports: false,
      },
    ],
    'jsx-quotes': ['error', 'prefer-double'],
    'multiline-comment-style': 'off',
    'multiline-ternary': ['error', 'never'],
    'no-constant-condition': 'error',
    'no-div-regex': 'error',
    'no-implicit-coercion': 'error',
    'no-import-assign': 'warn',
    'no-native-reassign': 'error',
    'no-negated-condition': 'error',
    'no-useless-call': 'error',
    'prefer-regex-literals': 'warn',
    'require-atomic-updates': 'error',

    // Replaced with new proposals
    'react/jsx-props-no-spreading': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',

    // IMPORT
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-unused-modules': 'off', // Super broken at the moment
    'import/imports-first': 'error',

    // PROMISE
    'promise/no-callback-in-promise': 'error',
    'promise/no-new-statics': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-return-in-finally': 'error',
    'promise/no-return-wrap': ['error', { allowReject: true }],
    'promise/param-names': 'error',
    'promise/valid-params': 'error',

    // REACT
    'react/destructuring-assignment': 'off', // Broken with class properties
    'react/forbid-prop-types': ['error', { forbid: ['any', 'array'] }],
    'react/jsx-handler-names': [
      'error',
      {
        eventHandlerPrefix: 'handle',
        eventHandlerPropPrefix: 'on',
      },
    ],
    'react/jsx-key': 'error',
    'react/jsx-no-literals': 'error',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-sort-default-props': [
      'error',
      {
        ignoreCase: true,
      },
    ],
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
        shorthandFirst: true,
        noSortAlphabetically: true,
        reservedFirst: true,
      },
    ],
    'react/no-did-mount-set-state': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/sort-comp': [
      'error',
      {
        order: ['statics', 'properties', 'lifecycle', 'everything-else', 'handlers', 'renderers'],
        groups: {
          statics: [
            'propTypes',
            'defaultProps',
            'contextType',
            'contextTypes',
            'childContextTypes',
          ],
          properties: [
            '/^(?!on).+$/',
            '/^(?!handle).+$/',
            '/^(?!render).+$/',
            '/^.+Ref$/',
            'state',
          ],
          lifecycle: [
            'constructor',
            'getDerivedStateFromProps',
            'componentWillMount',
            'UNSAFE_componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'UNSAFE_componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'UNSAFE_componentWillUpdate',
            'getSnapshotBeforeUpdate',
            'componentDidUpdate',
            'componentDidCatch',
            'componentWillUnmount',
          ],
          handlers: ['/^on.+$/', '/^handle.+$/'],
          renderers: ['/^render.+$/', 'render'],
        },
      },
    ],
    'react/sort-prop-types': [
      'error',
      {
        ignoreCase: true,
        callbacksLast: true,
        requiredFirst: false,
        sortShapeProp: true,
      },
    ],

    // UNICORN
    'unicorn/catch-error-name': 'error',
    'unicorn/consistent-function-scoping': 'warn',
    'unicorn/custom-error-definition': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/explicit-length-check': 'error',
    'unicorn/filename-case': 'off',
    'unicorn/import-index': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-hex-escape': 'error',
    'unicorn/no-fn-reference-in-iterator': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-process-exit': 'error',
    'unicorn/no-zero-fractions': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-dataset': 'warn',
    'unicorn/prefer-event-key': 'error',
    'unicorn/prefer-exponentiation-operator': 'error',
    'unicorn/prefer-flat-map': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-node-append': 'error',
    'unicorn/prefer-node-remove': 'error',
    'unicorn/prefer-starts-ends-with': 'error',
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-spread': 'off', // Currently broken
    'unicorn/prefer-text-content': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/regex-shorthand': 'error',
    'unicorn/throw-new-error': 'error',
  },

  overrides: [
    {
      files: [`*.test.${EXTS_GROUP}`],
      rules: {
        'unicorn/no-fn-reference-in-iterator': 'off',
      },
    },
  ],
};
