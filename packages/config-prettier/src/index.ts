import { PrettierConfig } from '@beemo/driver-prettier';
import { IGNORE_PATHS } from '@airbnb/nimbus-common';

/**
 * Create a root project config for a project.
 */
export function getConfig(): PrettierConfig {
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
}

/**
 * Return a list of common files to ignore.
 */
export function getIgnoreList(): string[] {
  return [
    ...IGNORE_PATHS,
    'lerna.json',
    'npm-shrinkwrap.json',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.eslint.json',
    'tsconfig.options.json',
    'CHANGELOG.md',
  ];
}
