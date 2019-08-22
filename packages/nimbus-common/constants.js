// @ts-check

exports.EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

exports.EXTS_GROUP = '{ts,tsx,js,jsx}';

exports.TJSX_EXT_PATTERN = /\.m?(t|j)sx?$/;

exports.ASSET_EXT_PATTERN = /\.(ttf|eot|otf|svg|woff|woff2|mp3|png|jpg|jpeg|gif|ico|css|scss)$/;

exports.GQL_EXT_PATTERN = /\.(gql|graphql)$/;

exports.IGNORE_PATHS = [
  'coverage/',
  'node_modules/',
  'public/',
  'esm/',
  'lib/',
  'tmp/',
  'dist/',
  '*.d.ts',
];

exports.NODE_VERSION = '8.9';

exports.NODE_TARGET = { node: exports.NODE_VERSION };

exports.WEB_TARGET = { ie: 10 };
