const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const { getPackage } = require('@airbnb/nimbus-common');

const { WEBPACK_ESM_SCOPES, WEBPACK_ESM_PACKAGES } = process.env;

const ROOT = process.cwd();
const PROD = process.env.NODE_ENV === 'production';
const PORT = 8081;
const esmScopes = ['@airbnb', '@irbnb'];
const esmPackages = [
  'aesthetic',
  'aesthetic-*',
  'airbnb-*',
  'emojibase',
  'emojibase-*',
  'interweave',
  'interweave-*',
  'lodash-es',
  'optimal',
  'shapeshifter',
  'shapeshifter-*',
];

if (WEBPACK_ESM_SCOPES) {
  esmScopes.push(...WEBPACK_ESM_SCOPES.split(','));
}

if (WEBPACK_ESM_PACKAGES) {
  esmPackages.push(...WEBPACK_ESM_PACKAGES.split(','));
}

exports.PROD = PROD;
exports.ROOT = ROOT;
exports.PORT = PORT;

/**
 * @returns {{ [key: string]: string }}
 */
exports.getESMAliases = function getESMAliases() {
  const aliases = {};
  const pkg = getPackage();
  const buildTargets = ['lib', 'build', 'dist'];

  glob
    .sync(
      [
        path.join(ROOT, `node_modules/{${esmScopes.join(',')}}/*`),
        path.join(ROOT, `node_modules/{${esmPackages.join(',')}}`),
      ],
      {
        absolute: true,
        onlyDirectories: true,
        onlyFiles: false,
      },
    )
    .forEach(modulePath => {
      const packageName = modulePath.split('/node_modules/')[1];
      const esLessName = packageName.replace(/-es$/, '');
      const hasEsFolder = fs.existsSync(path.join(modulePath, 'es'));
      const hasEsmFolder = fs.existsSync(path.join(modulePath, 'esm'));

      // airbnb-foo/lib -> airbnb-foo/esm
      // optimal/lib -> optimal/esm
      if (hasEsFolder || hasEsmFolder) {
        const esPath = hasEsFolder ? `${packageName}/es` : `${packageName}/esm`;
        const aliased = buildTargets.some(targetFolder => {
          if (fs.existsSync(path.join(modulePath, targetFolder))) {
            aliases[`${packageName}/${targetFolder}`] = esPath;

            return true;
          }

          return false;
        });

        if (!aliased) {
          aliases[`${packageName}$`] = esPath;
        }

        // lodash -> lodash-es
      } else if (packageName.endsWith('-es') && pkg.dependencies && pkg.dependencies[esLessName]) {
        aliases[esLessName] = packageName;
      }
    });

  return aliases;
};

let favicon = '';

/**
 * @param {string} srcPath
 * @returns {string}
 */
exports.getFavIcon = function getFavIcon(srcPath) {
  if (favicon) {
    return favicon;
  }

  const prodPath = path.join(srcPath, 'favicon.png');
  const devPath = path.join(srcPath, 'favicon-dev.png');

  if (!PROD && fs.existsSync(devPath)) {
    favicon = devPath;
  } else if (fs.existsSync(prodPath)) {
    favicon = prodPath;
  }

  return favicon;
};
