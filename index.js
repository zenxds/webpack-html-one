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
      const css = names.find(name => /\.css$/i.test(name))
      const js = names.find(name => /\.js$/i.test(name))

      if (!html) {
        callback()
        return
      }

      const $ = cheerio.load(assets[html].source())
      const $head = $('head')
      const $body = $('body')
      if (css) {
        $head.append(`<style>${assets[css].source()}</style>`)
        delete assets[css]
      }
      if (js) {
        $body.append(`<script>${assets[js].source()}</script>`)
        delete assets[js]
      }

      $('link, script').each((index, elem) => {
        const $elem = $(elem)
        let src = $elem.attr('href') || $elem.attr('src')
        if (!src) {
          return
        }

        src = src.split('?')[0]

        if (src === css || src === js) {
          $elem.remove()
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
