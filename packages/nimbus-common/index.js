// @ts-check

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const glob = require('fast-glob');

/**
 * @typedef { import("@boost/core").PackageConfig } PackageConfig
 * @typedef NimbusSettings
 * @property {string} buildFolder
 * @property {number} coverage
 * @property {string} docsFolder
 * @property {object} env
 * @property {boolean} graphql
 * @property {boolean} library
 * @property {boolean} next
 * @property {boolean} node
 * @property {boolean} react
 * @property {string} srcFolder
 * @property {string} testFolder
 */

exports.execa = execa;
exports.glob = glob;

/**
 * @param {string} filePath
 * @param {boolean} existsCheck
 * @returns {string}
 */
exports.fromRoot = function fromRoot(filePath, existsCheck = false) {
  const absPath = path.join(process.cwd(), filePath);

  if (existsCheck && !fs.existsSync(absPath)) {
    return '';
  }

  return absPath;
};

let pkgCache = null;

/**
 * @returns {PackageConfig}
 */
exports.getPackage = function getPackage() {
  const instance = process.beemo && process.beemo.tool;

  if (instance && instance.package) {
    return instance.package;
  }

  if (pkgCache) {
    return pkgCache;
  }

  // eslint-disable-next-line
  pkgCache = require(exports.fromRoot('package.json'));

  return pkgCache;
};

/**
 * @returns {NimbusSettings}
 */
exports.getSettings = function getSettings() {
  const instance = process.beemo && process.beemo.tool;
  const settings = {};
  const pkg = exports.getPackage();

  if (instance && instance.config && instance.config.settings) {
    Object.assign(settings, instance.config.settings);
    // @ts-ignore
  } else if (pkg.nimbus && pkg.nimbus.settings) {
    // @ts-ignore
    Object.assign(settings, pkg.nimbus.settings);
  }

  return {
    buildFolder: 'lib',
    coverage: 75,
    docsFolder: 'docs',
    env: {},
    graphql: false,
    library: false,
    next: false,
    node: false,
    react: false,
    srcFolder: 'src',
    testFolder: 'test',
    ...settings,
  };
};
