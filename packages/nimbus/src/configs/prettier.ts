import { getConfig, getIgnoreList } from '@airbnb/config-prettier';

export default {
  ...getConfig(),
  ignore: getIgnoreList(),
};
