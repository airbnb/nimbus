/* eslint-disable no-param-reassign, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import sourceMappingURL from 'source-map-url';

function getAssetName(chunks: webpack.compilation.Chunk[], chunkName: string) {
  return chunks.filter((chunk) => chunk.name === chunkName)?.[0].name;
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
      script.attributes.src?.indexOf(manifestAssetName) >= 0;

    if (isManifestScript) {
      return {
        tagName: 'script',
        voidTag: true,
        attributes: {
          type: 'text/javascript',
        },
        innerHTML: sourceMappingURL.removeFrom(compilation.assets[manifestAssetName].source()),
      };
    }

    return script;
  });
}

export default class InlineManifestPlugin {
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
          const runtime = [];
          const { assets } = htmlPluginData;
          const assetName = getAssetName(compilation.chunks, name);

          console.log(htmlPluginData);

          if (assetName && htmlPluginData.plugin.assetName.inject === false) {
            runtime.push('<script>');
            runtime.push(sourceMappingURL.removeFrom(compilation.assets[assetName].source()));
            runtime.push('</script>');

            const runtimeIndex = assets.js.indexOf(assets.publicPath + assetName);

            if (runtimeIndex >= 0) {
              assets.js.splice(runtimeIndex, 1);
            }
          }

          assets.js.push(runtime.join(''));

          cb(null, htmlPluginData);
        },
      );
    });
  }
}
