// @ts-check

const { getConfig, getIgnoreList } = require('@airbnb/config-prettier');

module.exports = {
  ...getConfig(),
  ignore: getIgnoreList(),
};
