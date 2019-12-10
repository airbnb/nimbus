// Keep in sync with the `tsconfig.options.json` file in this package.

import { TypeScriptConfig } from '@beemo/driver-typescript';

export interface TypeScriptOptions {
  buildFolder: string;
  includeTests?: boolean;
  library?: boolean;
  next?: boolean;
  node?: boolean;
  react?: boolean;
  srcFolder: string;
  testFolder: string;
  typesFolder: string;
  workspaces?: string[];
}

/**
 * Create common compiler options.
 */
export function getCompilerOptions({
  library = false,
  next = false,
  node = false,
  react = false,
}: Partial<TypeScriptOptions>): TypeScriptConfig['compilerOptions'] {
  const options: TypeScriptConfig['compilerOptions'] = {
    allowSyntheticDefaultImports: true,
    declaration: library,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: next && !library,
    jsx: 'preserve',
    lib: ['dom', 'esnext'],
    module: node ? 'commonjs' : 'esnext',
    moduleResolution: 'node',
    noEmitOnError: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    pretty: true,
    removeComments: false,
    strict: true,
    target: next || node ? 'es2018' : 'es2015',
    // Use define in development for spec accuracy,
    // but omit in production for smaller file sizes.
    useDefineForClassFields: next && process.env.NODE_ENV === 'development',
  };

  if (react) {
    options.jsx = 'react';
  }

  return options;
}

/**
 * Create a root configuration object for a single project.
 */
export function getConfig(options: TypeScriptOptions): TypeScriptConfig {
  const config = {
    compilerOptions: getCompilerOptions(options)!,
    include: [`./${options.srcFolder}/**/*`, `./${options.typesFolder}/**/*`],
    exclude: ['**/node_modules/*'],
  };

  if (options.includeTests) {
    config.include.push(`./${options.testFolder}/**/*`);
  }

  if (options.library) {
    config.compilerOptions.declarationDir = `./${options.buildFolder}`;
  }

  config.compilerOptions.outDir = `./${options.buildFolder}`;

  return config;
}

/**
 * Create a root configuration object for a multi-project that uses project references.
 */
export function getConfigWithProjectRefs(options: Partial<TypeScriptOptions>): TypeScriptConfig {
  const config = {
    compilerOptions: getCompilerOptions(options)!,
    files: [],
    references: [],
  };

  config.compilerOptions.composite = true;
  config.compilerOptions.declarationMap = true;

  return config;
}
