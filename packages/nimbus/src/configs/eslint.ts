import { getExtendsList, getIgnoreList } from '@airbnb/config-eslint';
import { getSettings } from '@airbnb/nimbus-common';

const { tool } = process.beemo;
const { next, node } = getSettings();

export default {
  extends: getExtendsList({
    next,
    node,
    prettier: tool.isPluginEnabled('driver', 'prettier'),
    typescript: tool.isPluginEnabled('driver', 'typescript'),
  }),
  ignore: getIgnoreList(),
};
