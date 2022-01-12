const defaults = require('lodash.defaults')
const cheerio = require('cheerio')
const minify = require('html-minifier').minify

class Plugin {
  constructor(options={}) {
    this.options = defaults(options, {
      minify: true,
      decodeEntities: true
    })
  }

  apply(compiler) {
    const options = this.options
    const { webpack } = compiler
    const { Compilation } = webpack
    const { RawSource } = webpack.sources

    compiler.hooks.compilation.tap("html-one-plugin", compilation => {
      compilation.hooks.processAssets.tap({
        name: "html-one-plugin",
        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
      }, assets => {
        const names = Object.keys(assets)

        names.forEach((name) => {
          if (!/\.html$/i.test(name)) {
            return
          }

          const $ = cheerio.load(assets[name].source(), {
            decodeEntities: options.decodeEntities
          })

          $('link[rel="stylesheet"], script').each((index, elem) => {
            const $elem = $(elem)
            const src = $elem.attr('href') || $elem.attr('src')

            if (!src) {
              return
            }

            const asset = names.find(name => {
              return src.indexOf(name) > -1
            })

            if (!asset || !assets[asset]) {
              return
            }

            if (/\.css$/i.test(asset)) {
              $elem.replaceWith(`<style>${assets[asset].source()}</style>`)
              compilation.deleteAsset(asset)
            }

            if (/\.js$/i.test(asset)) {
              $elem.replaceWith(`<script>${assets[asset].source()}</script>`)
              compilation.deleteAsset(asset)
            }
          })

          compilation.updateAsset(name, new RawSource(options.minify ? minify($.html(), {
            collapseWhitespace: true
          }) : $.html()))
        })
      })
    })
  }
}

module.exports = Plugin
