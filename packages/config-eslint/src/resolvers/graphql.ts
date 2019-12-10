import { GQL_EXT_PATTERN } from '@airbnb/nimbus-common/lib/constants';

export const interfaceVersion = 2;

export function resolve(source: string): { found: boolean; path?: unknown } {
  if (source.match(GQL_EXT_PATTERN)) {
    return { found: true, path: null };
  }

  return { found: false };
}
