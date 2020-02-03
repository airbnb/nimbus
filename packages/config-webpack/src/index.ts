/* eslint-disable no-nested-ternary */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// @ts-ignore Not typed
import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackConfig } from '@beemo/driver-webpack';
import {
  getCommitHash,
  EXTS,
  ASSET_EXT_PATTERN,
  GQL_EXT_PATTERN,
  TJSX_EXT_PATTERN,
} from '@airbnb/nimbus-common';
import { PORT, ROOT, PROD, getESMAliases, getFavIcon } from './helpers';

export interface WebpackOptions {
  analyzeBundle?: boolean;
  buildFolder?: string;
  port?: string | number;
  react?: boolean;
  sourceMaps?: boolean;
  srcFolder: string;
}

export function getConfig({
  analyzeBundle = false,
  buildFolder = 'public',
  port = PORT,
  react = false,
  sourceMaps = false,
  srcFolder,
}: WebpackOptions): WebpackConfig {
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

    // @ts-ignore Fix upstream
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
}
