// @ts-check

const path = require('path');
const { IGNORE_PATHS } = require('@airbnb/nimbus-common/constants');

/**
 * @typedef {object} ConfigOptions
 * @property {boolean} [next]
 * @property {boolean} [prettier]
 * @property {boolean} [typescript]
 */

/**
 * @param {string} filePath
 * @returns {string}
 */
function fromHere(filePath) {
  return `./${path.relative(process.cwd(), path.join(__dirname, filePath))}`;
}

/**
 * Create a root project config for a project.
 *
 * @param {ConfigOptions} options
 * @returns {string[]}
 */
exports.getExtendsList = function getExtendsList({
  next = false,
  prettier = false,
  typescript = false,
}) {
  const paths = [fromHere('presets/base.js')];

  // Future rules
  if (next) {
    paths.push(fromHere('presets/next.js'));
  }

  // TypeScript
  if (typescript) {
    paths.push(fromHere('presets/typescript.js'));
  }

  // Prettier
  if (prettier) {
    paths.push(fromHere('presets/prettier.js'));

    if (typescript) {
      paths.push('prettier/@typescript-eslint');
    }

    if (next) {
      paths.push('prettier/unicorn');
    }
  }

  return paths;
};

/**
 * Return a list of common files to ignore.
 *
 * @returns {string[]}
 */
exports.getIgnoreList = function getIgnoreList() {
  return [...IGNORE_PATHS];
};
