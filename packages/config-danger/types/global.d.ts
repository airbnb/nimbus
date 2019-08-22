/* eslint-disable */

import * as dng from 'danger';

declare global {
  const danger: typeof dng.danger;
  const message: typeof dng.message;
  const warn: typeof dng.warn;
  // Globally defined by Jasmine (Jest)
  // const fail: typeof dng.fail;
}
