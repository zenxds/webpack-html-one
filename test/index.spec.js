const MemoryFileSystem = require('memory-fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Plugin = require('..')

const compiler = webpack({
  entry: `${__dirname}/entry.js`,
  output: {
    publicPath: "./",
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
       {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
       }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname}/template.html`,
      inject: 'body',
      hash: true
    }),
    new MiniCssExtractPlugin({
      chunkFilename: '[name].[hash].css',
      filename: '[name].css'
    }),
  ]
})

const fs = new MemoryFileSystem()
compiler.outputFileSystem = fs

test('compile', (done) => {
  const plugin = new Plugin()
  plugin.apply(compiler)
  compiler.run((err, stats) => {
    console.log(fs.readFileSync(`${__dirname}/dist/index.html`).toString())
    expect(Object.keys(stats.compilation.assets).length).toBe(1)
    done()
  })
})
