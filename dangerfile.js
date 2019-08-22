/* eslint-disable import/no-extraneous-dependencies */

import {
  checkForInvalidLocks,
  checkForConventionalPrefix,
  checkForConventionalSquashCommit,
} from '@airbnb/config-danger';

checkForInvalidLocks();
checkForConventionalPrefix();
checkForConventionalSquashCommit();
