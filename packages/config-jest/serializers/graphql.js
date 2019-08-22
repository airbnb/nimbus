exports.test = function test(value) {
  return value && value.loc && value.loc.source && value.loc.source.body;
};

exports.print = function print(value) {
  return require('graphql/language/printer').print(value);
};
