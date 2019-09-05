// @ts-check
/* eslint-disable no-nested-ternary */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { getCommitHash } = require('@airbnb/nimbus-common/git');
const {
  EXTS,
  ASSET_EXT_PATTERN,
  GQL_EXT_PATTERN,
  TJSX_EXT_PATTERN,
} = require('@airbnb/nimbus-common/constants');
const { PORT, ROOT, PROD, getESMAliases, getFavIcon } = require('./helpers');

/**
 * @typedef { import("@beemo/driver-webpack").WebpackConfig } WebpackConfig
 * @typedef {object} ConfigOptions
 * @property {boolean} [analyzeBundle]
 * @property {string} [buildFolder]
 * @property {string|number} [port]
 * @property {boolean} [react]
 * @property {boolean} [sourceMaps]
 * @property {string} srcFolder
 */

/**
 * @param {ConfigOptions} options
 * @returns {WebpackConfig}
 */
exports.getConfig = function getConfig({
  analyzeBundle = false,
  buildFolder = 'public',
  port = PORT,
  react = false,
  sourceMaps = false,
  srcFolder,
}) {
  const srcPath = path.join(ROOT, srcFolder);
  const publicPath = path.join(ROOT, buildFolder);
  const entry = [srcPath];
  const plugins = [
    new webpack.NamedChunksPlugin(),
    new webpack.EnvironmentPlugin({
      LAZY_LOAD: false,
      RENDER_ENV: 'browser',
      SILENCE_POLYGLOT_WARNINGS: true,
      SENTRY_RELEASE: PROD ? getCommitHash() || 'production' : 'development',
      AMP: false,
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(!PROD),
    }),
    new HtmlWebpackPlugin({
      chunks: ['runtime', 'core'],
      chunksSortMode: 'none',
      template: `${srcFolder}/index.html`,
      filename: 'index.html',
      favicon: getFavIcon(srcPath),
    }),
  ];

  if (analyzeBundle) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  if (PROD) {
    plugins.push(
      // Inline the runtime chunk to enable long-term caching
      new InlineManifestWebpackPlugin(),
    );
  } else if (react) {
    plugins.push(
      // Enable hot module replacement
      new webpack.HotModuleReplacementPlugin(),
    );
  }

  return {
    mode: PROD ? 'production' : 'development',

    bail: PROD,

    entry: {
      core: entry,
    },

    plugins,

    module: {
      rules: [
        {
          test: TJSX_EXT_PATTERN,
          include: [srcPath],
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              configFile: true,
            },
          },
        },
        {
          test: ASSET_EXT_PATTERN,
          use: {
            loader: 'url-loader',
            options: {
              limit: 1000,
              name: 'assets/[name].[ext]?[hash:7]',
              publicPath: '/',
            },
          },
        },
        {
          test: GQL_EXT_PATTERN,
          use: {
            loader: 'webpack-graphql-loader',
            options: {
              output: 'document',
              removeUnusedFragments: true,
            },
          },
        },
      ],
    },

    resolve: {
      alias: getESMAliases(),
      extensions: ['.wasm', '.mjs', ...EXTS],
    },

    output: {
      path: publicPath,
      publicPath: '/',
      filename: PROD ? 'assets/[name].[contenthash].js' : 'assets/[name].js',
      chunkFilename: PROD ? 'assets/[name].[contenthash].chunk.js' : 'assets/[name].[id].js',
      sourceMapFilename: '[file].map',
    },

    devtool: PROD ? (sourceMaps ? 'source-map' : false) : 'cheap-module-source-map',

    // @ts-ignore
    devServer: {
      compress: true,
      contentBase: publicPath,
      disableHostCheck: true,
      headers: {
        'Service-Worker-Allowed': '/',
      },
      historyApiFallback: true,
      hot: true,
      port, // This can be a unix socket path so a string is valid
      watchOptions: {
        ignored: /node_modules/,
      },
    },

    optimization: {
      runtimeChunk: 'single',
      minimize: PROD,
      minimizer: [
        new TerserPlugin({
          sourceMap: sourceMaps,
        }),
      ],
    },

    performance: false,

    stats: !PROD,
  };
};
