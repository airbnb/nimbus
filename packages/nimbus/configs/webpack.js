// @ts-check

const { getConfig } = require('@airbnb/config-webpack');
const { getSettings } = require('@airbnb/nimbus-common');

const { srcFolder, react } = getSettings();

module.exports = getConfig({
  analyzeBundle: !!process.env.WEBPACK_ANALYZE,
  port: process.env.PORT,
  react,
  sourceMaps: !!process.env.SOURCE_MAPS,
  srcFolder,
});
