// @ts-check

const { IGNORE_PATHS } = require('@airbnb/nimbus-common/constants');

/**
 * @typedef { import("@beemo/driver-prettier").PrettierConfig } PrettierConfig
 */

/**
 * Create a root project config for a project.
 *
 * @returns {PrettierConfig}
 */
exports.getConfig = function getConfig() {
  return {
    arrowParens: 'avoid',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 100,
    proseWrap: 'always',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
  };
};

/**
 * Return a list of common files to ignore.
 *
 * @returns {string[]}
 */
exports.getIgnoreList = function getIgnoreList() {
  return [
    ...IGNORE_PATHS,
    'lerna.json',
    'npm-shrinkwrap.json',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.options.json',
    'CHANGELOG.md',
  ];
};
