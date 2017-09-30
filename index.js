const defaults = require('lodash.defaults')
const webpackSources = require('webpack-sources')
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

    compiler.plugin("emit", function(compilation, callback) {
      const assets = compilation.assets
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
            delete assets[asset]                  
          }
          if (/\.js$/i.test(asset)) {
            $elem.replaceWith(`<script>${assets[asset].source()}</script>`)
            delete assets[asset]                  
          }
        })

        assets[name] = new webpackSources.RawSource(options.minify ? minify($.html(), {
          collapseWhitespace: true
        }) : $.html())
      })

      callback()
    })
  }
}

module.exports = Plugin
