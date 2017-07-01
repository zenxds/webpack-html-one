# webpack-html-one

webpack plugin to combine css/js into html

most use for mobile web page

## install

```
npm install webpack-html-one --save
```

## example

```
const HtmlOnePlugin = require('webpack-html-one')

// webpack.config.js
{
  plugins: [
    new HtmlOnePlugin()
  ]
}
```

## options

```
minify: default true, minify html output
```
