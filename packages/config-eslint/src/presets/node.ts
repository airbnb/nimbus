import { ESLintConfig } from '@beemo/driver-eslint';

const config: ESLintConfig = {
  env: {
    browser: false,
    node: true,
  },
};

export = config;
