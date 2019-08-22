// @ts-check

const path = require('path');
const {
  EXTS,
  IGNORE_PATHS,
  ASSET_EXT_PATTERN,
  GQL_EXT_PATTERN,
  TJSX_EXT_PATTERN,
} = require('@airbnb/nimbus-common/constants');

/**
 * @typedef { import("@beemo/driver-jest").JestConfig } JestConfig
 * @typedef {object} ConfigOptions
 * @property {boolean} [graphql]
 * @property {boolean} [react]
 * @property {string} srcFolder
 * @property {string} testFolder
 * @property {number} [threshold]
 * @property {string[]} [workspaces]
 */

const exts = EXTS.map(ext => ext.slice(1));
const extsWithoutJSON = exts.filter(ext => ext !== 'json');

/**
 * @param {string} filePath
 * @returns {string}
 */
function fromHere(filePath) {
  return `<rootDir>/${path.relative(process.cwd(), path.join(__dirname, filePath))}`;
}

/**
 * @param {string} folder
 * @returns {string}
 */
function createCoveragePattern(folder) {
  return `**/${folder}/**/*.{${extsWithoutJSON.join(',')}}`;
}

/**
 * Create a root project config for a project.
 *
 * @param {ConfigOptions} options
 * @returns {JestConfig}
 */
exports.getConfig = function getConfig({
  graphql = false,
  react = false,
  srcFolder,
  testFolder,
  threshold = 75,
  workspaces = [],
}) {
  const roots = [];
  const setupFiles = [fromHere('setup/shims.js'), fromHere('setup/console.js')];
  const setupFilesAfterEnv = [fromHere('bootstrap/consumer.js')];

  if (workspaces.length > 0) {
    workspaces.forEach(wsPath => {
      roots.push(path.join('<rootDir>', wsPath.replace('/*', '')));
    });
  } else {
    roots.push('<rootDir>');
  }

  if (react) {
    setupFiles.push(fromHere('setup/dom.js'));
    setupFilesAfterEnv.unshift(fromHere('bootstrap/react.js'));
  }

  if (graphql) {
    setupFilesAfterEnv.unshift(fromHere('bootstrap/graphql.js'));
  }

  /** @type {JestConfig} */
  const config = {
    bail: false,
    collectCoverageFrom: [createCoveragePattern(srcFolder), createCoveragePattern(testFolder)],
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: IGNORE_PATHS.filter(ignore => !ignore.startsWith('*')),
    coverageReporters: ['lcov', 'json-summary', 'html'],
    coverageThreshold: {
      global: {
        branches: threshold,
        functions: threshold,
        lines: threshold,
        statements: threshold,
      },
    },
    globals: {
      __DEV__: true,
    },
    // Add custom mock extension so libs can export mocks
    moduleFileExtensions: ['mock.js', ...exts, 'node'],
    moduleNameMapper: {
      [`^.+${ASSET_EXT_PATTERN.source}`]: fromHere('mocks/file.js'),
    },
    roots,
    setupFiles,
    setupFilesAfterEnv,
    testEnvironment: react ? 'jsdom' : 'node',
    testURL: 'http://localhost',
    timers: 'fake',
    verbose: false,
  };

  if (graphql) {
    config.transform = {
      [`^.+${GQL_EXT_PATTERN.source}`]: fromHere('transformers/graphql.js'),
      [`^.+${TJSX_EXT_PATTERN.source}`]: 'babel-jest',
    };
  }

  return config;
};
