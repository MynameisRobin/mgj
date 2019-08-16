require('./check-versions')()
var path = require('path')

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
var fs = require('fs');
var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var utils = require('./utils')
// default port where dev server listens for incoming traffic
let port= process.argv[3]|| config.dev.port;

// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb && cb()
  })
})
let moduelName = process.argv[2];
let proxys = utils.moduleConfig.proxyTable || proxyTable
// console.log('utils.moduleConfig', utils.moduleConfig)
// proxy api requests
for(let context in proxys){
var options = proxys[context]
  if (typeof options === 'string') {
    options = {
      target: options,
      logLevel:'debug',
      changeOrigin: true,
    }
  }
  let proxyPath = context;
  app.use(proxyMiddleware(proxyPath , options))
}

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)
// serve pure static assets

var staticPath = path.join(__dirname, '..','src','module', moduelName,'static')
if (fs.existsSync(staticPath)) {
	app.use('/' + moduelName + '/static', express.static(staticPath))
}
app.use('/vue-assets', express.static(path.join(__dirname, '..','src','common','assets')))
app.use('/vue-assets/js', express.static(path.join(__dirname, '..','dist','vue-assets','js')))
var uri = 'http://localhost:' + port+'/';
devMiddleware.waitUntilValid(function () {
  console.log('> Listening at ' + uri + '\n')
})

app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
})

module.exports = app
