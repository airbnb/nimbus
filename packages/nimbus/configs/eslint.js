// @ts-check

const { getExtendsList, getIgnoreList } = require('@airbnb/config-eslint');
const { getSettings } = require('@airbnb/nimbus-common');

const { tool } = process.beemo;
const { next } = getSettings();

module.exports = {
  extends: getExtendsList({
    next,
    prettier: tool.isPluginEnabled('driver', 'prettier'),
    typescript: tool.isPluginEnabled('driver', 'typescript'),
  }),
  ignore: getIgnoreList(),
};
