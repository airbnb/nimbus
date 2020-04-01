/* eslint-disable no-nested-ternary */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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
import InlineManifestPlugin from './plugins/InlineManifestPlugin';
import { PORT, ROOT, PROD, getESMAliases, getFavIcon, getParallelValue } from './helpers';

export interface WebpackOptions {
  analyzeBundle?: boolean;
  buildFolder?: string;
  parallel?: boolean | string | number;
  port?: string | number;
  react?: boolean;
  root?: string;
  sourceMaps?: boolean;
  srcFolder: string;
}

export function getConfig({
  analyzeBundle = false,
  buildFolder = 'public',
  parallel = true,
  port = PORT,
  react = false,
  root = ROOT,
  sourceMaps = false,
  srcFolder,
}: WebpackOptions): WebpackConfig {
  const srcPath = path.join(root, srcFolder);
  const publicPath = path.join(root, buildFolder);
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
      new InlineManifestPlugin(),
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

    context: root,

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
          parallel: getParallelValue(parallel),
        }),
      ],
    },

    performance: false,

    stats: !PROD,
  };
}
