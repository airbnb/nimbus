/* eslint-disable no-param-reassign, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, import/no-extraneous-dependencies */

import HtmlWebpackPlugin from 'html-webpack-plugin';
import sourceMappingURL from 'source-map-url';
import webpack from 'webpack';

function getAssetName(chunks: webpack.compilation.Chunk[], chunkName: string) {
  return chunks.filter((chunk) => chunk.name === chunkName)?.[0]?.files[0];
}

function inlineWhenMatched(
  compilation: webpack.compilation.Compilation,
  scripts: HtmlWebpackPlugin.HtmlTagObject[],
  manifestAssetName: string,
) {
  return scripts.map((script) => {
    const isManifestScript =
      script.tagName === 'script' &&
      typeof script.attributes.src === 'string' &&
      script.attributes.src?.includes(manifestAssetName);

    if (isManifestScript) {
      return {
        tagName: 'script',
        voidTag: false,
        attributes: {
          type: 'text/javascript',
        },
        innerHTML: sourceMappingURL.removeFrom(compilation.assets[manifestAssetName].source()),
      };
    }

    return script;
  });
}

export default class InlineManifestPlugin implements webpack.Plugin {
  name: string;

  constructor(name: string = 'runtime') {
    this.name = name;
  }

  apply(compiler: webpack.Compiler) {
    const { name } = this;

    compiler.hooks.emit.tap('InlineManifestWebpackPlugin', (compilation) => {
      const assetName = getAssetName(compilation.chunks, name);

      if (assetName) {
        delete compilation.assets[assetName];
      }
    });

    compiler.hooks.compilation.tap('InlineManifestWebpackPlugin', (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.alterAssetTags.tapAsync('InlineManifestWebpackPlugin', (data, cb) => {
        const assetName = getAssetName(compilation.chunks, name);

        if (assetName) {
          data.assetTags.scripts = inlineWhenMatched(
            compilation,
            data.assetTags.scripts,
            assetName,
          );
        }

        cb(null, data);
      });

      hooks.beforeAssetTagGeneration.tapAsync(
        'InlineManifestWebpackPlugin',
        (htmlPluginData, cb) => {
          const assetName = getAssetName(compilation.chunks, name);

          // @ts-ignore Option exists
          if (assetName && htmlPluginData.plugin.options.inject === false) {
            const { assets } = htmlPluginData;
            const runtime = `<script>${sourceMappingURL.removeFrom(
              compilation.assets[assetName].source(),
            )}</script>`;
            const runtimeIndex = assets.js.indexOf(assets.publicPath + assetName);

            if (runtimeIndex >= 0) {
              assets.js.splice(runtimeIndex, 1);
            }

            assets.js.push(runtime);
          }

          cb(null, htmlPluginData);
        },
      );
    });
  }
}
