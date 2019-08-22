const loader = require('graphql-tag/loader');

exports.process = function process(src) {
  return loader.call({ cacheable() {} }, src);
};
