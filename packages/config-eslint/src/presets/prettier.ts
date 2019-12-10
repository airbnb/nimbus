import { ESLintConfig } from '@beemo/driver-eslint';

const config: ESLintConfig = {
  extends: ['prettier', 'prettier/react'],

  plugins: ['prettier'],

  rules: {
    'prettier/prettier': 'error',
  },
};

export default config;
