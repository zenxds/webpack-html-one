import test from 'ava'
import MemoryFileSystem from 'memory-fs'
import webpack from 'webpack'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const Plugin = require('..')

const compiler = webpack({
  entry: `${__dirname}/entry.js`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
       {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(['css-loader'])
       }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname}/template.html`,
      hash: true
    }),
    new ExtractTextPlugin({
      disable: false,
      allChunks: true,
      filename: 'main.css'
    })
  ]
})
compiler.outputFileSystem = new MemoryFileSystem()

test.cb(t => {
  const plugin = new Plugin()
  plugin.apply(compiler)
  compiler.run((err, stats) => {
    if (!err && Object.keys(stats.compilation.assets).length === 1) {
      t.pass()
      t.end() 
    } else {
      t.fail()
    }
  })
})
