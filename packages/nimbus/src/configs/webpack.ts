import { getConfig } from '@airbnb/config-webpack';
import { getSettings } from '@airbnb/nimbus-common';

const { srcFolder, react } = getSettings();

export default getConfig({
  analyzeBundle: !!process.env.WEBPACK_ANALYZE,
  port: process.env.PORT,
  react,
  sourceMaps: !!process.env.SOURCE_MAPS,
  srcFolder,
});
