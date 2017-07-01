const webpackSources = require('webpack-sources')
const cheerio = require('cheerio')
const minify = require('html-minifier').minify

class Plugin {
  constructor(options) {
    this.options = Object.assign({
      minify: true
    }, options || {})
  }

  apply(compiler) {
    const options = this.options

    compiler.plugin("emit", function(compilation, callback) {
      const assets = compilation.assets
      const names = Object.keys(assets)
      const html = names.find(name => /\.html$/i.test(name))

      if (!html) {
        callback()
        return
      }

      const $ = cheerio.load(assets[html].source())

      $('link[rel="stylesheet"], script').each((index, elem) => {
        const $elem = $(elem)
        let src = $elem.attr('href') || $elem.attr('src')
        if (!src) {
          return
        }

        src = src.split('?')[0]
        if (!assets[src]) {
          return
        }

        if (/\.css$/i.test(src)) {
          $elem.replaceWith(`<style>${assets[src].source()}</style>`)
          delete assets[src]                  
        }
        if (/\.js$/i.test(src)) {
          $elem.replaceWith(`<script>${assets[src].source()}</script>`)
          delete assets[src]                  
        }
      })

      assets[html] = new webpackSources.RawSource(options.minify ? minify($.html(), {
        collapseWhitespace: true
      }) : $.html())
      callback()
    })
  }
}

module.exports = Plugin
