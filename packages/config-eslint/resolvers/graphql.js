const { GQL_EXT_PATTERN } = require('@airbnb/nimbus-common/constants');

exports.interfaceVersion = 2;

exports.resolve = function resolve(source) {
  if (source.match(GQL_EXT_PATTERN)) {
    return { found: true, path: null };
  }

  return { found: false };
};
