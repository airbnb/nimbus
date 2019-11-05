// @ts-check
// Keep in sync with the `tsconfig.options.json` file in this package.

/**
 * @typedef { import("@beemo/driver-typescript").TypeScriptConfig } TypeScriptConfig
 * @typedef {object} ConfigOptions
 * @property {string} buildFolder
 * @property {boolean} [includeTests]
 * @property {boolean} [library]
 * @property {boolean} [next]
 * @property {boolean} [node]
 * @property {boolean} [react]
 * @property {string} srcFolder
 * @property {string} testFolder
 * @property {string} typesFolder
 * @property {string[]} [workspaces]
 */

/**
 * Create common compiler options.
 *
 * @param {Partial<ConfigOptions>} options
 * @returns {TypeScriptConfig['compilerOptions']}
 */
exports.getCompilerOptions = function getCompilerOptions({
  library = false,
  next = false,
  node = false,
  react = false,
}) {
  /** @type {TypeScriptConfig['compilerOptions']} */
  const options = {
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
    // @ts-ignore Not in parent type
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
};

/**
 * Create a root configuration object for a single project.
 *
 * @param {ConfigOptions} options
 * @returns {TypeScriptConfig}
 */
exports.getConfig = function getConfig(options) {
  const config = {
    compilerOptions: exports.getCompilerOptions(options),
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
};

/**
 * Create a root configuration object for a multi-project that uses project references.
 *
 * @param {Partial<ConfigOptions>} options
 * @returns {TypeScriptConfig}
 */
exports.getConfigWithProjectRefs = function getConfigWithProjectRefs(options) {
  const config = {
    compilerOptions: exports.getCompilerOptions(options),
    files: [],
    references: [],
  };

  config.compilerOptions.composite = true;
  config.compilerOptions.declarationMap = true;

  return config;
};
