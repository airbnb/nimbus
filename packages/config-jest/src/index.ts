import { Path } from '@beemo/core';
import { JestConfig } from '@beemo/driver-jest';
import {
  EXTS,
  IGNORE_PATHS,
  ASSET_EXT_PATTERN,
  GQL_EXT_PATTERN,
  TJSX_EXT_PATTERN,
} from '@airbnb/nimbus-common';

export interface JestOptions {
  graphql?: boolean;
  react?: boolean;
  srcFolder: string;
  testFolder: string;
  threshold?: number;
  workspaces?: string[];
}

const exts = EXTS.map((ext) => ext.slice(1));
const extsWithoutJSON = exts.filter((ext) => ext !== 'json');

function fromHere(filePath: string): string {
  return `<rootDir>/${new Path(process.cwd()).relativeTo(
    new Path(__dirname, '..', filePath).resolve(),
  )}`;
}

function createCoveragePattern(folder: string): string {
  return `**/${folder}/**/*.{${extsWithoutJSON.join(',')}}`;
}

/**
 * Create a root project config for a project.
 */
export function getConfig({
  graphql = false,
  react = false,
  srcFolder,
  testFolder,
  threshold = 75,
  workspaces = [],
}: JestOptions): JestConfig {
  const roots: string[] = [];
  const setupFiles = [fromHere('setup/shims.js'), fromHere('setup/console.js')];
  const setupFilesAfterEnv = [fromHere('bootstrap/consumer.js')];

  if (workspaces.length > 0) {
    workspaces.forEach((wsPath) => {
      roots.push(new Path('<rootDir>', wsPath.replace('/*', '')).path());
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

  const config: JestConfig = {
    bail: false,
    collectCoverageFrom: [createCoveragePattern(srcFolder), createCoveragePattern(testFolder)],
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: IGNORE_PATHS.filter((ignore) => !ignore.startsWith('*')),
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
}
